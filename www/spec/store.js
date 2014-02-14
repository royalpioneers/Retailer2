describe('app', function() {
	
	var data = [
		    {"id": 12,
		     "name": 'store one',
		     "items_list": [
				    {
				      "model_image": "/static/website/images/icon/default_product.png",
				      "clients_discount": {},
				      "quantity": 20,
				      "max": 20,
				      "id": 212,
				      "wholesale_price": "500.00",
				      "retail_price": "413.00",
				      "model_name": "Product model default",
				      "product_name": "Product default",
				      "variants": [{'id': 2, 'quantity': '15', 'name': 'feature1', 'value': 'VAL1', 'additional_cost': '12'},
			              {'id': 3, 'quantity': '18', 'name': 'feature2', 'value': 'VAL2', 'additional_cost': '5.8'}],
				    },
				    {
				      "model_image": "/static/website/images/icon/default_product.png",
				      "clients_discount": {},
				      "quantity": 30,
				      "max": 30,
				      "id": 217,
				      "wholesale_price": "60.00",
				      "retail_price": "48.00",
				      "model_name": "mivariante",
				      "product_name": "miproducto",
				      "variants": [],
				    },
				    {
				      "model_image": "/static/website/images/icon/default_product.png",
				      "clients_discount": {},
				      "quantity": 6,
				      "max": 6,
				      "id": 218,
				      "wholesale_price": "123.00",
				      "retail_price": "122.00",
				      "model_name": "asdasd",
				      "product_name": "asdasd",
				      "variants": [{'id': 6, 'quantity': '10', 'name': 'feature1', 'value': 'VAL1', 'additional_cost': '15'}],
				    }
				  ]
		    }, 
		    {"id": 15,
			     "name": 'store two',
			     "items_list": [
					    {
					      "model_image": "/static/website/images/icon/default_product.png",
					      "clients_discount": {},
					      "quantity": 15,
					      "id": 212,
					      "wholesale_price": "500.00",
					      "retail_price": "413.00",
					      "model_name": "Product model default",
					      "product_name": "Product default",
					      "variants": [{'id': 2, 'quantity': '30', 'name': 'feature1', 'value': 'VAL1', 'additional_cost': '12'},
				              {'id': 3, 'quantity': '30', 'name': 'feature2', 'value': 'VAL2', 'additional_cost': '5.8'}],
					    },
					    {
					      "model_image": "/static/website/images/icon/default_product.png",
					      "clients_discount": {},
					      "quantity": 8,
					      "id": 218,
					      "wholesale_price": "123.00",
					      "retail_price": "122.00",
					      "model_name": "asdasd",
					      "product_name": "asdasd",
					      "variants": [{'id': 6, 'quantity': '20', 'name': 'feature1', 'value': 'VAL1', 'additional_cost': '15'}],
					    }
					  ]
			    }
		];
	
	var client = {
  		  "id": 52,
  		  "name": "bbb",
  		  "image": "/static/img/designer_default_photo.jpg",
  		  "type": 1,
  		  "products": [],
  		  "total": 0
  		};
	
    describe('change store', function() {
    	var products = simple_clone(data);
    	var product_selected = products[0]['items_list'][0];
		var categoryFactory = new CategoryFactory();
		window.localStorage.setItem('buyerInventory', JSON.stringify(products));
		var buyerInventoryFactory = new BuyerInventoryFactory();
		buyerInventoryFactory.set_current_store(12);
		var clientFactory = new ClientFactory();
    	var buyerInventory = new BuyerInventoryModel(categoryFactory, buyerInventoryFactory, clientFactory);
    	var obj_checked = true;
    	var obj = {data: function(label){
    		return (label == 'id') ? product_selected.variants[0].id : product_selected.id;
    	}, attr: function(label){
    		if (label == 'checked') {
    			return obj_checked;
    		}
    	}};
    	clientFactory.set_client_selected(client);
    	
    	it('add first variant: not repeat', function() {
    		window.localStorage.setItem(buyerInventoryFactory.storage_id_inventory, JSON.stringify(products));
        	buyerInventory.chose_variant(obj);
        	buyerInventory.chose_variant(obj);
        	buyerInventory.chose_variant(obj);
        	var clientSelected = clientFactory.get_client_selected();

        	expect(clientSelected.products.length).toEqual(1);
        	expect(clientSelected.products[0].variant_id).toEqual(2);
        	expect(clientSelected.products[0].quantity).toEqual('15');
        	expect(clientSelected.products[0].price).toEqual('512.00');
        });
    	
    	it('remove item', function(){
    		window.localStorage.setItem(buyerInventoryFactory.storage_id_inventory, JSON.stringify(products));
    		buyerInventory.chose_variant(obj);
    		obj_checked = false;
        	buyerInventory.chose_variant(obj);
        	
        	var clientSelected = clientFactory.get_client_selected();

        	expect(clientSelected.products.length).toEqual(0);
    	});
    });
});
