/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
describe('app', function() {
	function clone(obj) {
		return jQuery.extend(true, [], obj);
	}
	
	data = [
		    {"id": 12,
		     "name": 'store one',
		     "priority": '2',
		     "items_list": [
				    {
				      "model_image": "/static/website/images/icon/default_product.png",
				      "clients_discount": {},
				      "quantity": 20,
				      "quantity_all": 35,
				      "id": 212,
				      "wholesale_price": "500.00",
				      "retail_price": "413.00",
				      "model_name": "Product model default",
				      "product_name": "Product default",
				      "variants": [{'id': 2, 'quantity': '12', 'quantity_all': '22', 'name': 'feature1', 'value': 'VAL1', 'additional_cost': '12'},
			              {'id': 3, 'quantity': '8', 'quantity_all': '13', 'name': 'feature2', 'value': 'VAL2', 'additional_cost': '5.8'}],
				    },
				    {
				      "model_image": "/static/website/images/icon/default_product.png",
				      "clients_discount": {},
				      "quantity": 2,
				      "quantity_all": 2,
				      "id": 217,
				      "wholesale_price": "60.00",
				      "retail_price": "48.00",
				      "model_name": "mivariante",
				      "product_name": "miproducto",
				      "variants": [{'id': 4, 'quantity': '2', 'quantity_all': '2', 'name': 'feature3', 'value': 'VAL1', 'additional_cost': '15'}],
				    },
				    {
				      "model_image": "/static/website/images/icon/default_product.png",
				      "clients_discount": {},
				      "quantity": 20,
				      "quantity_all": 28,
				      "id": 218,
				      "wholesale_price": "123.00",
				      "retail_price": "122.00",
				      "model_name": "asdasd",
				      "product_name": "asdasd",
				      "variants": [{'id': 6, 'quantity': '10', 'quantity_all': '18', 'name': 'feature4', 'value': 'VAL1', 'additional_cost': '15'},
				                   {'id': 7, 'quantity': '10', 'quantity_all': '10', 'name': 'feature5', 'value': 'VAL1', 'additional_cost': '15'}],
				    }
	    ]},
	    {
	    	"id": 13,
		     "name": 'store one',
		     "priority": '1',
		     "items_list": [
				{
				    "model_image": "/static/website/images/icon/default_product.png",
				    "clients_discount": {},
				    "quantity": 15,
				    "quantity_all": 35,
				    "id": 212,
				    "wholesale_price": "500.00",
				    "retail_price": "413.00",
				    "model_name": "Product model default",
				    "product_name": "Product default",
				    "variants": [{'id': 2, 'quantity': '10', 'quantity_all': '22', 'name': 'feature1', 'value': 'VAL1', 'additional_cost': '12'},
				        {'id': 3, 'quantity': '5', 'quantity_all': '13', 'name': 'feature2', 'value': 'VAL2', 'additional_cost': '5.8'}],
				  },
				  {
				    "model_image": "/static/website/images/icon/default_product.png",
				    "clients_discount": {},
				    "quantity": 8,
				    "quantity_all": 18,
				    "id": 218,
				    "wholesale_price": "123.00",
				    "retail_price": "122.00",
				    "model_name": "asdasd",
				    "product_name": "asdasd",
				    "variants": [{'id': 6, 'quantity': '8', 'quantity_all': '18', 'name': 'feature1', 'value': 'VAL1', 'additional_cost': '15'}],
				  }
		     ]
	    }
    ];
	
    describe('create invoice', function() {
    	
        it('update items: only product without all', function() {
        	var products = clone(data);
        	window.localStorage.setItem('buyerInventory', JSON.stringify(products));
        	var buyerInventoryFactory = new BuyerInventoryFactory([], '', false);
        	buyerInventoryFactory.set_current_store(12);
        	var invoice = new InvoiceModel(buyerInventoryFactory);
        	var product_selected = products[0]['items_list'][0];
        	var exists = 0;
        	localStorage.setItem(invoice.id_products, JSON.stringify(products));
        	product_selected.quantity = 15;
        	
        	/* ACTION */
        	invoice.success_create([product_selected], 0);

        	buyerInventoryFactory.update_total_qty_for_items(true);
        	buyerInventoryFactory.update_total_qty_for_items(false);

        	var stores = buyerInventoryFactory.get_stores();
        	for (var z in stores) {
        		var updated_products = stores[z]['items_list'];
	        	for (index in updated_products) {
	        		var product = updated_products[index];
	        		if (product.id == product_selected.id) {
	        			if (stores[z].id == 12) {
	        				expect(product.quantity).toEqual(5);
	        			} else {
	        				expect(product.quantity).toEqual(15);
	        			}
	        			expect(product.quantity_all).toEqual(20);
	        			exists+= 1;
	        		}
	        	}
        	}
        	expect(exists).toEqual(2);
        });
        
        it('update items: only product with all', function() {
        	var products = clone(data);
        	window.localStorage.setItem('buyerInventory', JSON.stringify(products));
        	var buyerInventoryFactory = new BuyerInventoryFactory([], '', false);
        	buyerInventoryFactory.set_current_store(12);
        	var invoice = new InvoiceModel(buyerInventoryFactory);
        	var product_selected = products[0]['items_list'][0];
        	var exists = 0;
        	localStorage.setItem(invoice.id_products, JSON.stringify(products));
        	product_selected.quantity = 20;
        	
        	/* ACTION */
        	invoice.success_create([product_selected], 1);

        	buyerInventoryFactory.update_total_qty_for_items(true);
        	buyerInventoryFactory.update_total_qty_for_items(false);

        	var stores = buyerInventoryFactory.get_stores();
        	for (var z in stores) {
        		var updated_products = stores[z]['items_list'];
	        	for (index in updated_products) {
	        		var product = updated_products[index];
	        		if (product.id == product_selected.id) {
	        			if (stores[z].id == 12) {
	        				expect(product.quantity).toEqual(15);
	        			} else {
	        				expect(product.quantity).toEqual(0);
	        			}
	        			expect(product.quantity_all).toEqual(15);
	        			exists+= 1;
	        		}
	        	}
        	}
        	expect(exists).toEqual(2);
        });
        
        it('update items: with variant without all', function() {
        	var products = clone(data);
        	window.localStorage.setItem('buyerInventory', JSON.stringify(products));
        	var buyerInventoryFactory = new BuyerInventoryFactory([], '', false);
        	buyerInventoryFactory.set_current_store(12);
        	var invoice = new InvoiceModel(buyerInventoryFactory);
        	var product_selected = products[0]['items_list'][2];
        	product_selected.variant_id = 6;
        	var exists = 0;
        	localStorage.setItem(invoice.id_products, JSON.stringify(products));
        	product_selected.quantity = 9;
        	
        	/* ACTION */
        	invoice.success_create([product_selected], 0);

        	buyerInventoryFactory.update_total_qty_for_items(true);
        	buyerInventoryFactory.update_total_qty_for_items(false);

        	var stores = buyerInventoryFactory.get_stores();
        	for (var z in stores) {
        		var updated_products = stores[z]['items_list'];
	        	for (index in updated_products) {
	        		var product = updated_products[index];
	        		if (product.id == product_selected.id) {
	        			for (var index2 in product.variants) {
	        				if (product.variants[index2].id == product_selected.variant_id) {
	        					if (stores[z].id == 12) {
	        						expect(parseInt(product.variants[index2].quantity)).toEqual(1);
	        					} else {
	        						expect(parseInt(product.variants[index2].quantity)).toEqual(8);
	        					}
	        					expect(product.variants[index2].quantity_all).toEqual(9);
	        					exists+= 1;
	        				}
	        			}
	        		}
	        	}
        	}
        	expect(exists).toEqual(2);
        });
        
        it('update items: with variant with all', function() {
        	var products = clone(data);
        	window.localStorage.setItem('buyerInventory', JSON.stringify(products));
        	var buyerInventoryFactory = new BuyerInventoryFactory([], '', false);
        	buyerInventoryFactory.set_current_store(12);
        	var invoice = new InvoiceModel(buyerInventoryFactory);
        	var product_selected = products[0]['items_list'][2];
        	product_selected.variant_id = 6;
        	var exists = 0;
        	localStorage.setItem(invoice.id_products, JSON.stringify(products));
        	product_selected.quantity = 12;
        	
        	/* ACTION */
        	invoice.success_create([product_selected], 1);

        	buyerInventoryFactory.update_total_qty_for_items(true);
        	buyerInventoryFactory.update_total_qty_for_items(false);

        	var stores = buyerInventoryFactory.get_stores();
        	for (var z in stores) {
        		var updated_products = stores[z]['items_list'];
	        	for (index in updated_products) {
	        		var product = updated_products[index];
	        		if (product.id == product_selected.id) {
	        			for (var index2 in product.variants) {
	        				if (product.variants[index2].id == product_selected.variant_id) {
	        					if (stores[z].id == 12) {
	        						expect(parseInt(product.variants[index2].quantity)).toEqual(6);
	        					} else {
	        						expect(parseInt(product.variants[index2].quantity)).toEqual(0);
	        					}
	        					expect(product.variants[index2].quantity_all).toEqual(6);
	        					exists+= 1;
	        				}
	        			}
	        		}
	        	}
        	}
        	expect(exists).toEqual(2);
        });
        
        it('update items: with unique variant with all', function() {
        	var products = clone(data);
        	window.localStorage.setItem('buyerInventory', JSON.stringify(products));
        	var buyerInventoryFactory = new BuyerInventoryFactory([], '', false);
        	buyerInventoryFactory.set_current_store(12);
        	var invoice = new InvoiceModel(buyerInventoryFactory);
        	var product_selected = products[0]['items_list'][2];
        	product_selected.variant_id = 7;
        	var exists = 0;
        	localStorage.setItem(invoice.id_products, JSON.stringify(products));
        	product_selected.quantity = 5;

        	/* ACTION */
        	invoice.success_create([product_selected], 1);

        	buyerInventoryFactory.update_total_qty_for_items(true);
        	buyerInventoryFactory.update_total_qty_for_items(false);

        	var stores = buyerInventoryFactory.get_stores();
        	for (var z in stores) {
        		var updated_products = stores[z]['items_list'];
	        	for (index in updated_products) {
	        		var product = updated_products[index];
	        		if (product.id == product_selected.id) {
	        			for (var index2 in product.variants) {
	        				if (product.variants[index2].id == product_selected.variant_id) {
	        					if (stores[z].id == 12) {
	        						expect(parseInt(product.variants[index2].quantity)).toEqual(5);
	        					}
	        					expect(product.variants[index2].quantity_all).toEqual(5);
	        					exists+= 1;
	        				}
	        			}
	        		}
	        	}
        	}
        	expect(exists).toEqual(1);
        });
        
        it('update variants quantity', function() {
        	var products = clone(data);
        	window.localStorage.setItem('buyerInventory', JSON.stringify(products));
        	var buyerInventoryFactory = new BuyerInventoryFactory([], '', false);
        	buyerInventoryFactory.set_current_store(12);
        	var invoice = new InvoiceModel(buyerInventoryFactory);
        	var product_selected = products[0]['items_list'][0];
        	var exists = false;
        	var variant_exists = false;
        	localStorage.setItem(invoice.id_products, JSON.stringify(products));
        	product_selected.quantity = 9;
        	product_selected.variant_id = 2;

        	/* ACTION */
        	invoice.success_create([product_selected], 0);

        	buyerInventoryFactory.update_total_qty_for_items(true);
        	buyerInventoryFactory.update_total_qty_for_items(false);

        	var updated_products = buyerInventoryFactory.get_current_list();
        	for (index in updated_products) {
        		var product = updated_products[index];
        		if (product.id == product_selected.id) {
        			expect(product.quantity).toEqual(20);
        			exists = true;
        			for (var index2 in product.variants) {
	    				var variant = product.variants[index2];
	    				if (variant.id == parseInt(product_selected.variant_id)) {
	    					expect(parseInt(variant.quantity)).toEqual(3);
	    					expect(parseInt(variant.quantity_all)).toEqual(13);
	    					variant_exists = true;
	    				}
	    			}
        		}
        	}
        	expect(exists).toEqual(true);
        	expect(variant_exists).toEqual(true);
        });
        
        it('invalid client products', function() {
        	var products = clone(data);
        	window.localStorage.setItem('buyerInventory', JSON.stringify(products));
        	var buyerInventoryFactory = new BuyerInventoryFactory([], '', false);
        	buyerInventoryFactory.set_current_store(12);
        	var invoice = new InvoiceModel(buyerInventoryFactory);
        	var product_selected = products[0]['items_list'][0];
        	localStorage.setItem(invoice.id_products, JSON.stringify(products));
        	product_selected.quantity = 25;

        	/* ACTION */
        	result = invoice.are_valid_products([product_selected]);
        	console.log(invoice.get_message());

        	expect(result).toEqual(false);
        });
        
        it('valid client products: equal', function() {
        	var products = clone(data);
        	window.localStorage.setItem('buyerInventory', JSON.stringify(products));
        	var buyerInventoryFactory = new BuyerInventoryFactory([], '', false);
        	buyerInventoryFactory.set_current_store(12);
        	var invoice = new InvoiceModel(buyerInventoryFactory);
        	var product_selected = products[0]['items_list'][0];
        	localStorage.setItem(invoice.id_products, JSON.stringify(products));
        	product_selected.quantity = 12;
        	
        	/* ACTION */
        	result = invoice.are_valid_products([product_selected]);
        	console.log(invoice.get_message());

        	expect(result).toEqual(true);
        });
        
        it('valid client products: lower', function() {
        	var products = clone(data);
        	window.localStorage.setItem('buyerInventory', JSON.stringify(products));
        	var buyerInventoryFactory = new BuyerInventoryFactory([], '', false);
        	buyerInventoryFactory.set_current_store(12);
        	var invoice = new InvoiceModel(buyerInventoryFactory);
        	var product_selected = products[0]['items_list'][0];
        	localStorage.setItem(invoice.id_products, JSON.stringify(products));
        	product_selected.quantity = 10;
        	
        	/* ACTION */
        	result = invoice.are_valid_products([product_selected]);
        	console.log(invoice.get_message());

        	expect(result).toEqual(true);
        });
        
        it('valid client products: zero', function() {
        	var products = clone(data);
        	window.localStorage.setItem('buyerInventory', JSON.stringify(products));
        	var buyerInventoryFactory = new BuyerInventoryFactory([], '', false);
        	buyerInventoryFactory.set_current_store(12);
        	var invoice = new InvoiceModel(buyerInventoryFactory);
        	var product_selected = products[0]['items_list'][0];
        	localStorage.setItem(invoice.id_products, JSON.stringify(products));
        	product_selected.quantity = 0;
        	
        	/* ACTION */
        	result = invoice.are_valid_products([product_selected]);
        	console.log(invoice.get_message());

        	expect(result).toEqual(false);
        });
        
        
    });
});
