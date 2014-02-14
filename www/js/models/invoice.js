var InvoiceModel = function(buyerInventoryFactory) {
	var model = this;
	model.message = '';

	model.success_create = function(client_products, type_update) {
		var stores = buyerInventoryFactory.get_stores();
		if (type_update == 0) { /* status priority : single store */
			for (var index1 in client_products) {
				var product = client_products[index1];
				var sold_quantity = product.quantity;
				for (var z in stores) {
					sold_quantity = model.update_sold_quantities_current_list(stores[z], sold_quantity, product, product.quantity);
				}
			}
		} else { /* stores priority : all stores */
			for (var index1 in client_products) {
				var product = client_products[index1];
				var sold_quantity = product.quantity;
				var stores_priorities = [];
				for (var z in stores) {
					stores_priorities.push(stores[z]);
				}
				for (var i = 0; i < stores_priorities.length - 1; i++) {
					for (var j = i + 1; j < stores_priorities.length; j++) {
						if (stores_priorities[j].priority < stores_priorities[i].priority) {
							var tmp = stores_priorities[i];
							stores_priorities[i] = stores_priorities[j];
							stores_priorities[j] = tmp;
						}
					}
				}
				var selected_store_id = buyerInventoryFactory.current_store;
				for (var z in stores_priorities) {
					buyerInventoryFactory.current_store = stores_priorities[z].id;
					sold_quantity = model.update_sold_quantities_current_list(stores_priorities[z], sold_quantity, product, product.quantity);
				}
				buyerInventoryFactory.current_store = selected_store_id;
			}
		}
		buyerInventoryFactory.update_quantity_all_for_all_products_in_stores();
	};

	model.update_sold_quantities_current_list = function(store, sold_quantity, product, sold_quantity_all) {
		var selected_store_id = buyerInventoryFactory.current_store;
		buyerInventoryFactory.current_store = store.id;
		var products = store.items_list;
		var discounted_quantity = sold_quantity;
		for (var index in products) {
			if (products[index].id == parseInt(product.id)) {
				if (typeof(product.variant_id) != 'undefined' && parseInt(product.variant_id) > 0) {
					for (var index2 in products[index].variants) {
						if (product.variant_id == products[index].variants[index2].id) {
							if (store.id == selected_store_id) {
								if (products[index].variants[index2].quantity >= sold_quantity) {
									products[index].variants[index2].quantity-=sold_quantity;
									sold_quantity = 0;
								} else {
									sold_quantity-= products[index].variants[index2].quantity;
									products[index].variants[index2].quantity = 0;
								}
							}
							products[index].variants[index2].quantity_all-=sold_quantity_all;
						}
					}
				} else {
					if (store.id == selected_store_id) {
						if (products[index].quantity >= sold_quantity) {
							products[index].quantity-=sold_quantity;
							sold_quantity = 0;
						} else {
							sold_quantity-=products[index].quantity;
							products[index].quantity = 0;
						}
					}
					products[index].quantity_all-=sold_quantity_all;
				}
			}
		}
		buyerInventoryFactory.set_current_list(products);
		buyerInventoryFactory.current_store = selected_store_id;
		return sold_quantity;
	};

	model.are_valid_products = function(client_products) {
		var products = buyerInventoryFactory.get_current_list();
		for (var index1 in client_products) {
			var client_product = client_products[index1];
			for (var index in products) {
				var product = products[index];
				if (product.id == client_product.id) {
					if (client_product.quantity == 0) {
						model.message = 'Invalid quantity, minimun 1 for "' + client_product.model_name + '"';
						return false;
					}
					if (!isNaN(parseInt(client_product.variant_id)) && parseInt(client_product.variant_id) > 0) {
						var found = false;
						for (var index2 in product.variants) {
							var variant = product.variants[index2];
							if (variant.id == client_product.variant_id) {
								if (client_product.quantity  > variant.quantity) {
									model.message = 'Invalid quantity, max '+ variant.quantity +' for "' + client_product.model_name + '"';
									return false;
								}
								found = true;
							}
						}
						if (!found)  {
							model.message = 'Invalid variant for "' + client_product.model_name + '"';
							return false;
						}
					} else {/* no variant */
						if (client_product.quantity > product.quantity) {
							model.message = 'Invalid quantity, max ' + product.quantity + ' for "' + client_product.model_name + '"';
							return false;
						}
					}
				}
			}
		}
		return true;
	};
	
	model.get_message = function() {
		var message = model.message;
		model.message = '';
		return message;
	};
	
	return model;
};