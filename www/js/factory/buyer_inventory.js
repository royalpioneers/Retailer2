var BuyerInventoryFactory = function(urls, token) {
	var factory = {};
	factory.urls = urls;
	factory.token = token;
	factory.cache = false;
	factory.storage_id_inventory = 'buyerInventory';

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
                    window.localStorage.removeItem("buyerInventory");
					window.localStorage.setItem('buyerInventory', JSON.stringify(data.items_list));
					handler(data.items_list);
				} else {
					return handler([]);
				}
			}
	    });
	};

    factory.store_inventory = function(inventory) {
		if(window.localStorage.getItem('buyerInventory')){
			var inventory_list = JSON.parse(window.localStorage.getItem('buyerInventory'));
			inventory_list.push(inventory);
			window.localStorage.setItem('buyerInventory', JSON.stringify(inventory_list));
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
		
    return factory;

}