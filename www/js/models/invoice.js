var InvoiceModel = function() {
	var model = this;
	model.message = '';
	model.id_products = 'buyerInventory';
	
	model.success_create = function(client_products) {
		var products = JSON.parse(localStorage.getItem(model.id_products));
		for (var index1 in client_products) {
			product = client_products[index1];
			for (var index in products) {
				if (products[index].id == parseInt(product.id)) {
					products[index].quantity-=product.quantity;
				}
			}
		}
		localStorage.setItem(model.id_products, JSON.stringify(products));
	};

	model.are_valid_products = function(client_products) {
		debugger;
		var products = JSON.parse(localStorage.getItem(model.id_products));
		for (var index1 in client_products) {
			client_product = client_products[index1];
			for (var index in products) {
				debugger;
				if (products[index].id == client_product.id) {
					debugger;
					if (client_product.quantity == 0 || client_product.quantity > products[index].quantity) {
						debugger;
						model.message = 'Ivalid quantity for "' + client_product.model_name + '"';
						return false;
					}					
				}
			}
		}
		debugger;
		return true;
	};
	
	model.get_message = function() {
		var message = model.message;
		model.message = '';
		return message;
	};
	
	return model;
};