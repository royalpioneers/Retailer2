var InvoiceModel = function(buyerInventoryFactory) {
	var model = this;
	model.message = '';

	model.success_create = function(client_products) {
		var products = buyerInventoryFactory.get_current_list();
		for (var index1 in client_products) {
			var product = client_products[index1];
			for (var index in products) {
				if (products[index].id == parseInt(product.id)) {
					if (typeof(product.variant_id) != 'undefined' && parseInt(product.variant_id) > 0) {
						for (var index2 in products[index].variants) {
							if (product.variant_id == products[index].variants[index2].id) {
								products[index].variants[index2].quantity-=product.quantity;
							}
						}
					} else {
						products[index].quantity-=product.quantity;
					}
				}
			}
		}
		buyerInventoryFactory.set_current_list(products);
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