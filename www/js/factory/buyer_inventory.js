var BuyerInventoryFactory = function(urls, token, cache) {
	var factory = {};
	factory.urls = urls;
	factory.token = token;
	factory.cache = cache;
	factory.storage_id_inventory = 'buyerInventory';
	factory.storage_id_analyzer_information = 'StorageAnalizerInformation';
	factory.storage_id_analyzer_information_time = 'StorageAnalizerInformationTime';
	factory.current_store = 0;
	factory.show_all_products = false;
	factory.list_all_products = [];
	
	factory.set_current_store = function(store_id) {
		factory.current_store = store_id;
	};

	factory.update_items_into_store = function(all) {
		if (all) {
			factory.show_all_products = true;
			factory.update_list_all_products();
		} else {
			factory.show_all_products = false;
		}
	};
	
	factory.update_list_all_products = function() {
		factory.list_all_products = [];
		store_list = window.localStorage.getItem(factory.storage_id_inventory);
		if (!store_list) {
			return false;
		}
		store_list = JSON.parse(store_list);
		for (var i in store_list) {
			for (var j in store_list[i].items_list) {
				var item = simple_clone(store_list[i].items_list[j]);
				factory.set_item_to_list_all_products(item);
			}
		}
	};
	
	factory.set_item_to_list_all_products = function(item) {
		var not_exists = true;
		for (var i in factory.list_all_products) {
			var current = factory.list_all_products[i];
			if (current.id == item.id) {
				not_exists = false;
				for (var j in item.variants) {
					factory.set_variant_to_item(current, item.variants[j]);
				}
			}
		}
		if (not_exists) {
			factory.list_all_products.push(item);
		}
	};

	factory.set_variant_to_item = function(item, variant) {
		var not_exists = true, current_total = 0, current_total_all = 0;
		for (var i in item.variants) {
			if (item.variants[i].id == variant.id) {
				not_exists = false;
				item.variants[i].quantity = parseInt(item.variants[i].quantity) + parseInt(variant.quantity);
			}
		}
		if (not_exists) {
			item.variants.push(variant);
		}
		for (var i in item.variants) {
			current_total+= parseInt(item.variants[i].quantity);
			current_total_all+= parseInt(item.variants[i].quantity_all);
		}
		item.quantity = current_total;
		item.quantity_all = current_total_all;
	};
	
	factory.update_quantity_all_for_all_products_in_stores = function() {
		var stores = factory.get_stores(), variants_totals = {}, product_totals = {};
		for (var i in stores) {
			for (var j in stores[i].items_list) {
				var quantity = 0, item = stores[i].items_list[j];
				for (var k in item.variants) {
					var variant = item.variants[k];
					quantity+= parseInt(variant.quantity);
					
					/* sum values all */
					if (typeof(variants_totals[variant.id]) == 'undefined') {
						variants_totals[variant.id] = 0;
					}
					variants_totals[variant.id]+= parseInt(variant.quantity);
				}
				item.quantity = quantity;

				/* sum values all */
				if (typeof(product_totals[item.id]) == 'undefined') {
					product_totals[item.id] = 0;
				}
				product_totals[item.id]+= quantity;
			}
		}

		/* set values all */
		for (var i in stores) {
			for (var j in stores[i].items_list) {
				var quantity = 0, item = stores[i].items_list[j];
				for (var k in item.variants) {
					item.variants[k].quantity_all = variants_totals[item.variants[k].id];
				}
				item.quantity_all = product_totals[item.id]
			}
		}
		window.localStorage.setItem(factory.storage_id_inventory, JSON.stringify(stores));
	};
	
	factory.get_all = function(store, handler, cache) {
		value = window.localStorage.getItem(factory.storage_id_inventory);
		if (value == 'undefined') {
			window.localStorage.removeItem(factory.storage_id_inventory);
		}
		var list = JSON.parse(window.localStorage.getItem(factory.storage_id_inventory));
		if ((factory.cache || cache) && list != null) {
			return handler(factory.get_items_from_store(store, list));
		}
		$.ajax({
			url: factory.urls.inventory,
			type: 'POST',
			data: {
                rp_token: factory.token
            },
			dataType: 'json',
			beforeSend: function(){
				loader();	           	
		   },
			success: function(data) {
				if (data.status == true) {
                    window.localStorage.removeItem(factory.storage_id_inventory);
					window.localStorage.setItem(factory.storage_id_inventory, JSON.stringify(data.stores));
					handler(factory.get_items_from_store(store, data.stores));
				} else {
					return handler([]);
				}
			},
			complete: function(){
        	   try{$.mobile.loading("hide");}catch(e){}
           }
	    });
	};

	factory.get_stores = function() {
		/* call after "factory.get_all" method */
		stores = JSON.parse(window.localStorage.getItem(factory.storage_id_inventory));
		if (typeof(stores) == 'undefined' || stores == null) {
			stores = [];
		}
		return stores;
	};


	factory.get_items_from_store = function(store_id, stores) {
		if (typeof(stores) == 'undefined') {
			stores = factory.get_stores();
		}
		if (factory.show_all_products) {
			return factory.list_all_products;
		}
		if ((typeof(store_id) == 'undefined' || store_id == null) && stores.length > 0)  {
			return stores[0].items_list;
		} else {
			store_id = parseInt(store_id);
			for (var i in stores) {
				var current = stores[i];
				if (current.id == store_id) {
					return current.items_list;
				}
			}
		}
		return [];
	};
	
	factory.get_current_list = function() {
		if (factory.show_all_products) {
			return factory.list_all_products;
		} else {
			return factory.get_items_from_store(factory.current_store);
		}
	};
	
	factory.set_current_list = function(items_list) {
		if(window.localStorage.getItem(factory.storage_id_inventory)){
			var store_list = JSON.parse(window.localStorage.getItem(factory.storage_id_inventory));
			for (var index in store_list) {
				if (factory.current_store == store_list[index].id) {
					store_list[index].items_list = items_list;
				}
			}
			window.localStorage.setItem(factory.storage_id_inventory, JSON.stringify(store_list));
		}
		if (factory.show_all_products) {
			factory.update_list_all_products();
		}
	};
	
    factory.store_inventory = function(inventory) {
		if(window.localStorage.getItem(factory.storage_id_inventory)){
			store_list = JSON.parse(window.localStorage.getItem(factory.storage_id_inventory));
			for (var index in store_list) {
				if (factory.current_store == store_list[index].id) {
					store_list[index].items_list.push(inventory);
				}
			}
			window.localStorage.setItem(factory.storage_id_inventory, JSON.stringify(store_list));
		}
		if (factory.show_all_products) {
			factory.update_list_all_products();
		}
	};

    factory.set_token = function(token) {
		factory.token = token;
	};

	factory.get_by_id = function(id) {
		var product = false;
		var list = factory.get_current_list();
		for (var index in list) {
			if (list[index].id == id) {
				product = list[index];
			}
		}
		return product;
	};
	
	factory.get_analyzer_information = function(store, handler, cache) {
		if (factory.show_all_products) {
			store = 'All';
		}
		var data_key = factory.storage_id_analyzer_information;
		var data_time_key = factory.storage_id_analyzer_information_time;
		if (!isNaN(parseInt(store))) {
			data_key = data_key + '_' + store;
			data_time_key = data_time_key + '_' + store;
		} else {
			data_key = data_key + '_all';
			data_time_key = data_time_key + '_all';
		}
		var info = JSON.parse(window.localStorage.getItem(data_key));
		if (cache && info != null) {
			return handler(info);
		}
		$.ajax({
	           url: urls.analyzer,
	           type: 'POST',
	           data: {
	                rp_token: factory.token,
	                store: store
	           },
	           dataType: 'json',
	           beforeSend: function(){
					loader();	           	
			   },
	           success: function(data){
	        	   var info = data.context['information'];
	               window.localStorage.removeItem(data_key);
	               window.localStorage.setItem(data_key, JSON.stringify(info));
	               
	               var new_date_time = new Date();
	               new_date_time = new_date_time.toLocaleDateString() + ' ' + new_date_time.toLocaleTimeString();
	               window.localStorage.removeItem(data_time_key);
	               window.localStorage.setItem(data_time_key, JSON.stringify(new_date_time));
	               handler(info);
	           },
	           complete: function(){
	        	   try{$.mobile.loading("hide");}catch(e){}
	           }
	        });
	};

	factory.get_analyzer_information_time = function(store) {
		if (factory.show_all_products) {
			store = 'All';
		}
		var data_time_key = factory.storage_id_analyzer_information_time;
		if (!isNaN(parseInt(store))) {
			data_time_key = data_time_key + '_' + store;
		} else {
			data_time_key = data_time_key + '_all';
		}
		return JSON.parse(window.localStorage.getItem(data_time_key));
	};
	
	function loader(){
		try{$.mobile.loading("show", {
            textVisible: true,
            theme: 'c',
            textonly: false
        });}catch(e){}
	}

    return factory;
};
