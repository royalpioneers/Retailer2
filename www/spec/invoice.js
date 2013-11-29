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
    describe('create invoice', function() {
    	
    	var products = [
      		    {
      		      "model_image": "/static/website/images/icon/default_product.png",
      		      "clients_discount": {},
      		      "quantity": 20,
      		      "id": 212,
      		      "wholesale_price": "500.00",
      		      "retail_price": "413.00",
      		      "model_name": "Product model default",
      		      "product_name": "Product default"
      		    },
      		    {
      		      "model_image": "/static/website/images/icon/default_product.png",
      		      "clients_discount": {},
      		      "quantity": 30,
      		      "id": 217,
      		      "wholesale_price": "60.00",
      		      "retail_price": "48.00",
      		      "model_name": "mivariante",
      		      "product_name": "miproducto"
      		    },
      		    {
      		      "model_image": "/static/website/images/icon/default_product.png",
      		      "clients_discount": {},
      		      "quantity": 50,
      		      "id": 218,
      		      "wholesale_price": "123.00",
      		      "retail_price": "122.00",
      		      "model_name": "asdasd",
      		      "product_name": "asdasd"
      		    }
      		  ];
    	
        it('update items', function() {
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
        			expect(product.quantity).toEqual(11);
        			exists = true;
        		}
        	}
        	expect(exists).toEqual(true);
        });
        
        it('invalid client products', function() {
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
        	var invoice = new InvoiceModel();
        	var product_selected = products[0];
        	localStorage.setItem(invoice.id_products, JSON.stringify(products));
        	product_selected.quantity = 20;
        	
        	/* ACTION */
        	result = invoice.are_valid_products([product_selected]);
        	console.log(invoice.get_message());

        	expect(result).toEqual(true);
        });
        
        it('valid client products: lower', function() {
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
        	var invoice = new InvoiceModel();
        	var product_selected = products[0];
        	localStorage.setItem(invoice.id_products, JSON.stringify(products));
        	product_selected.quantity = 0;
        	
        	/* ACTION */
        	result = invoice.are_valid_products([product_selected]);
        	console.log(invoice.get_message());

        	expect(result).toEqual(false);
        });
    });
});
