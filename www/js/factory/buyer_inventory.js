var BuyerInventoryFactory = function(urls, token, cache) {
	var factory = {};
	factory.urls = urls;
	factory.token = token;
	factory.cache = cache;
	factory.storage_id_inventory = 'buyerInventory';
	factory.storage_id_analyzer_information = 'StorageAnalizerInformation';
	factory.storage_id_analyzer_information_time = 'StorageAnalizerInformationTime';
	factory.current_store = 0;
	
	factory.set_current_store = function(store_id) {
		factory.current_store = store_id;
	};
	
	factory.update_total_qty_for_items = function(all) {
		store_list = window.localStorage.getItem(factory.storage_id_inventory);
		if (!store_list) {
			return false;
		}
		store_list = JSON.parse(store_list);
		if (all) {
			for (var i in store_list) {
				for (var j in store_list[i].items_list) {
					store_list[i].items_list[j].quantity_sin = store_list[i].items_list[j].quantity; 
					store_list[i].items_list[j].quantity = store_list[i].items_list[j].quantity_all;
					for (var k in store_list[i].items_list[j].variants) {
						store_list[i].items_list[j].variants[k].quantity_sin = store_list[i].items_list[j].variants[k].quantity;
						store_list[i].items_list[j].variants[k].quantity = store_list[i].items_list[j].variants[k].quantity_all;
					}
				}
			}
		} else {
			for (var i in store_list) {
				for (var j in store_list[i].items_list) {
					store_list[i].items_list[j].quantity = store_list[i].items_list[j].quantity_sin;
					for (var k in store_list[i].items_list[j].variants) {
						store_list[i].items_list[j].variants[k].quantity = store_list[i].items_list[j].variants[k].quantity_sin;
					}
				}
			}
		}
		window.localStorage.setItem(factory.storage_id_inventory, JSON.stringify(store_list));
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
			success: function(data) {
				if (data.status == true) {
                    window.localStorage.removeItem(factory.storage_id_inventory);
					window.localStorage.setItem(factory.storage_id_inventory, JSON.stringify(data.stores));
					handler(factory.get_items_from_store(store, data.stores));
				} else {
					return handler([]);
				}
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
		return factory.get_items_from_store(factory.current_store);
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
	};

    factory.set_token = function(token) {
		factory.token = token;
	};

	factory.get_by_id = function(id) {
		var product = false;
		var store_list = JSON.parse(window.localStorage.getItem(factory.storage_id_inventory));
		for (var index in store_list) {
			if (factory.current_store != store_list[index].id) {
				continue;
			}
			var list = store_list[index].items_list;
			for (var index in list) {
				if (list[index].id == id) {
					product = list[index];
				}
			}
		}
		return product;
	};
	
	factory.get_analyzer_information = function(store, handler, cache) {
		var data_key = factory.storage_id_analyzer_information;
		var data_time_key = factory.storage_id_analyzer_information_time;
		if (!isNaN(parseInt(store))) {
			data_key = data_key + '_' + store;
			data_time_key = data_time_key + '_' + store;
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
	           beforeSend: function beforeAjaxLoader(){
			       try{$.mobile.loading("show", {
			           textVisible: true,
			           theme: 'c',
			           textonly: false
			       });}catch(e){}
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
		var data_time_key = factory.storage_id_analyzer_information_time;
		if (!isNaN(parseInt(store))) {
			data_time_key = data_time_key + '_' + store;
		}
		return JSON.parse(window.localStorage.getItem(data_time_key));
	};
		
    return factory;
};
