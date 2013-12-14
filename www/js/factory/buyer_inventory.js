var BuyerInventoryFactory = function(urls, token) {
	var factory = {};
	factory.urls = urls;
	factory.token = token;
	factory.cache = false;
	factory.storage_id_inventory = 'buyerInventory';
	factory.storage_id_analyzer_information = 'StorageAnalizerInformation';
	factory.storage_id_analyzer_information_time = 'StorageAnalizerInformationTime';
	
	factory.get_all = function(handler, cache) {
		var list = JSON.parse(window.localStorage.getItem('buyerInventory'));
		if ((factory.cache || cache) && list != null) {
			return handler(list);
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
					window.localStorage.setItem(factory.storage_id_inventory, JSON.stringify(data.items_list));
					handler(data.items_list);
				} else {
					return handler([]);
				}
			}
	    });
	};

    factory.store_inventory = function(inventory) {
		if(window.localStorage.getItem(factory.storage_id_inventory)){
			var inventory_list = JSON.parse(window.localStorage.getItem(factory.storage_id_inventory));
			inventory_list.push(inventory);
			window.localStorage.setItem(factory.storage_id_inventory, JSON.stringify(inventory_list));
		}
	};

    factory.set_token = function(token) {
		factory.token = token;
	};

	factory.get_by_id = function(id) {
		var product = false;
		var list = JSON.parse(window.localStorage.getItem(factory.storage_id_inventory));
		for (var index in list) {
			if (list[index].id == id) {
				product = list[index];
			}
		}
		return product;
	};
	
	factory.get_analyzer_information = function(handler, cache) {
		var info = JSON.parse(window.localStorage.getItem(factory.storage_id_analyzer_information));
		if (cache && info != null) {
			alert('return cache');
			alert(info);
			return handler(info);
		}
		$.ajax({
	           url: urls.analyzer,
	           type: 'POST',
	           data: {
	                rp_token: token
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
	        	   alert('call complete');
	        	   try{
	        	   alert(data);
	        	   var info = data.context['information'];
	               window.localStorage.removeItem(factory.storage_id_analyzer_information);
	               window.localStorage.setItem(factory.storage_id_analyzer_information, JSON.stringify(info));
	               
	               var new_date_time = new Date();
	               new_date_time = new_date_time.toLocaleDateString() + ' ' + new_date_time.toLocaleTimeString();
	               window.localStorage.removeItem(factory.storage_id_analyzer_information_time);
	               window.localStorage.setItem(factory.storage_id_analyzer_information_time, JSON.stringify(new_date_time));
	               alert(new_date_time);
	               alert(info);
	               handler(info);
	        	   }catch(e){
	        		   alert('erroror XXXXX')
	        		   alert(e);
	        		}
	           },
	           complete: function(){
	        	   alert('COMPLETE');
	        	   try{$.mobile.loading("hide");}catch(e){alert(e);}
	           }
	        });
	};

	factory.get_analyzer_information_time = function() {
		return JSON.parse(window.localStorage.getItem(factory.storage_id_analyzer_information_time));
	};
		
    return factory;
}
