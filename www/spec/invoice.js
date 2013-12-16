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
		   
	var data = [
	    {
	      "model_image": "/static/website/images/icon/default_product.png",
	      "clients_discount": {},
	      "quantity": 11,
	      "max": 11,
	      "id": 212,
	      "wholesale_price": "500.00",
	      "retail_price": "413.00",
	      "model_name": "Product model default",
	      "product_name": "Product default",
	      "variants": [{'id': 2, 'quantity': '12', 'name': 'feature1', 'value': 'VAL1', 'additional_cost': '12'},
              {'id': 3, 'quantity': '8', 'name': 'feature2', 'value': 'VAL2', 'additional_cost': '5.8'}],
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
	      "quantity": 8,
	      "max": 8,
	      "id": 218,
	      "wholesale_price": "123.00",
	      "retail_price": "122.00",
	      "model_name": "asdasd",
	      "product_name": "asdasd",
	      "variants": [{'id': 6, 'quantity': '10', 'name': 'feature1', 'value': 'VAL1', 'additional_cost': '15'}],
	    }
	  ];
	
    describe('create invoice', function() {
    	
        it('update items', function() {
        	var products = clone(data);
        	var invoice = new InvoiceModel();
        	var product_selected = products[0];
        	var exists = false;
        	localStorage.setItem(invoice.id_products, JSON.stringify(products));
        	product_selected.quantity = 9;
        	
        	/* ACTION */
        	invoice.success_create([product_selected]);

        	var updated_products = JSON.parse(localStorage.getItem(invoice.id_products));
        	for (index in updated_products) {
        		product = updated_products[index];
        		if (product.id == product_selected.id) {
        			expect(product.quantity).toEqual(2);
        			exists = true;
        		}
        	}
        	expect(exists).toEqual(true);
        });
        
        it('invalid client products', function() {
        	var products = clone(data);
        	var invoice = new InvoiceModel();
        	var product_selected = products[0];
        	localStorage.setItem(invoice.id_products, JSON.stringify(products));
        	product_selected.quantity = 25;
        	
        	/* ACTION */
        	result = invoice.are_valid_products([product_selected]);
        	console.log(invoice.get_message());

        	expect(result).toEqual(false);
        });
        
        it('valid client products: equal', function() {
        	var products = clone(data);
        	var invoice = new InvoiceModel();
        	var product_selected = products[0];
        	localStorage.setItem(invoice.id_products, JSON.stringify(products));
        	product_selected.quantity = 11;
        	
        	/* ACTION */
        	result = invoice.are_valid_products([product_selected]);
        	console.log(invoice.get_message());

        	expect(result).toEqual(true);
        });
        
        it('valid client products: lower', function() {
        	var products = clone(data);
        	var invoice = new InvoiceModel();
        	var product_selected = products[0];
        	localStorage.setItem(invoice.id_products, JSON.stringify(products));
        	product_selected.quantity = 10;
        	
        	/* ACTION */
        	result = invoice.are_valid_products([product_selected]);
        	console.log(invoice.get_message());

        	expect(result).toEqual(true);
        });
        
        it('valid client products: zero', function() {
        	var products = clone(data);
        	var invoice = new InvoiceModel();
        	var product_selected = products[0];
        	localStorage.setItem(invoice.id_products, JSON.stringify(products));
        	product_selected.quantity = 0;
        	
        	/* ACTION */
        	result = invoice.are_valid_products([product_selected]);
        	console.log(invoice.get_message());

        	expect(result).toEqual(false);
        });
        
        it('update variants quantity', function() {
        	var products = clone(data);
        	var invoice = new InvoiceModel();
        	var product_selected = products[0];
        	var exists = false;
        	var variant_exists = false;
        	localStorage.setItem(invoice.id_products, JSON.stringify(products));
        	product_selected.quantity = 9;
        	product_selected.variant_id = 2;
        	
        	/* ACTION */
        	invoice.success_create([product_selected]);

        	var updated_products = JSON.parse(localStorage.getItem(invoice.id_products));
        	for (index in updated_products) {
        		var product = updated_products[index];
        		if (product.id == product_selected.id) {
        			expect(product.quantity).toEqual(11);
        			exists = true;
        			for (var index2 in product.variants) {
	    				var variant = product.variants[index2];
	    				if (variant.id == parseInt(product_selected.variant_id)) {
	    					expect(variant.quantity).toEqual(3);
	    					variant_exists = true;
	    				}
	    			}
        		}
        	}
        	expect(exists).toEqual(true);
        	expect(variant_exists).toEqual(true);
        });
    });
});
