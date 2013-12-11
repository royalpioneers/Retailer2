var BuyerInventoryModel = function(categoryFactory, buyerInventoryFactory, clientFactory) {
	var model= this;
	model.id_template_variant = 'id_template_option_variant';
	model.id_variants_list = 'id_selected_product_variants_list';
	model.class_btn_selected_variant = 'class_selected_variant';
	model.id_selected_product_name = 'selected_product_name';
	model.id_selected_product_variant_name = 'selected_product_variant_name';
	model.origin = '';
	model.origin_products = 1;
	model.origin_invoice = 2;
	model.selected_variant_id = 0;
	model.current_inventory = 0;

	model.init = function() {
		model.refresh_variants_list();
	};
	
    model.go_to_sub_variant_view = function(inventory_id) {
    	model.origin = model.origin_products;
    	if (model.inventory_has_variants(inventory_id)) {
    		var product = buyerInventoryFactory.get_by_id(inventory_id);
    		model.render_variant_list(product);
    		$.mobile.navigate("#pagina14");
    	} else {
    		model.render_variant_list();
    	}
    };
    
    model.inventory_has_variants = function (inventory_id) {
    	var product = buyerInventoryFactory.get_by_id(inventory_id);
    	if (product.variants.length > 0) {
    		return true;
    	}
    	return false;
    };

    model.render_variant_list = function(product) {
    	$('#'+model.id_selected_product_name).html(product.product_name);
    	$('#'+model.id_selected_product_variant_name).html(product.model_name);
    	$('#'+model.id_variants_list).html('');
    	if (typeof(product.id) !== 'undefined') {
    		for (var index in product.variants) {
    			var checked = model.is_inventory_in_current_select_variant(product.id, product.variants[index].id);
        		model.set_variant_to_list(product.variants[index], product, checked);
    		}
    	}
		model.refresh_variants_list();
	};

	model.set_variant_to_list = function(variant, inventory, checked) {
		var template = $('#'+model.id_template_variant).html();
		var price = model.calculate_price_by_client_selected(inventory, variant.id);

    	template = template.replace(/__id__/g, variant.id);
    	template = template.replace(/__parent__/g, inventory.id);
    	template = template.replace(/__name__/g, variant.name + ' ' + variant.value);
    	template = template.replace(/__price__/g, price);
    	if (checked) {
    		checked = 'checked="checked"';
    	} else {
    		checked = '';
    	}
    	template = template.replace(/__checked__/g, checked);
        $('#'+model.id_variants_list).append(template);

        model.refresh_variants_list();
	};

	model.refresh_variants_list = function() {
		$('#'+model.id_variants_list).trigger('create');
		model.related_event_variant();
	};
	
	model.related_event_variant = function() {
		$('.'+model.class_btn_selected_variant).unbind("click");
		$('.'+model.class_btn_selected_variant).bind("click", function(event){
			model.chose_variant($(this));
		});
	};
    
    model.chose_variant = function(obj) {
    	var variant_id = obj.data('id');
    	var inventory = buyerInventoryFactory.get_by_id(obj.data('parent'));
    	var updated = false;
    	var add = obj.attr('checked');
    	model.current_inventory = inventory.id;

    	/* recorre y agrega , si existe actualiza */
    	var client = clientFactory.get_client_selected();
    	if (add) {
	    	for (var i in client.products) {
	    		var product = client.products[i];
	    		if (product.id === inventory.id && product.variant_id === variant_id) {
	    			updated = true;
	    		}
	    	}
	    	if (!updated) {
	    		client.products.push(model.get_product_selected(inventory, variant_id));
	    	}
    	} else {
    		var valids = [];
	    	for (var i in client.products) {
	    		var product = client.products[i];
	    		if (product.id === inventory.id && product.variant_id === variant_id) {
	    			/* ignore selected */
	    		} else {
	    			valids.push(product);
	    		}
	    	}
	    	client.products = valids;
    	}
    	clientFactory.set_client_selected(client);
    };
    
    model.get_variant_from_product = function(product, variant_id) {
    	var variant = false;
    	if (product.variants.length < 1) {
    		return false;
    	}
    	for (var index in product.variants) {
    		if (product.variants[index].id == parseInt(variant_id)) {
    			variant = product.variants[index];
    		}
    	}
    	return variant;
    };
    
    model.get_product_selected = function(product, variant_id) {
    	var variant = model.get_variant_from_product(product, variant_id);
    	var productSelected = {
            'id': product.id,
            'product_name': product.product_name,
            'model_name': product.model_name + ' - ' + variant.name + ' ' + variant.value,
            'quantity': variant.quantity,
            'max': variant.quantity,
            'price': model.calculate_price_by_client_selected(product, variant_id),
            'model_image': product.model_image,
            'discount': model.get_discount_id_by_client_selected(product),
            'variant_id': variant_id,
        };
    	return productSelected;
    };
    
    model.calculate_price_by_client_selected = function(inventory, variant_id) {
    	var clientSelected = clientFactory.get_client_selected();
        var price = 0;
        var variant_value = 0;
        if(clientSelected.type === 1) {/* business client -> wholesale */            
            price = parseFloat(inventory.wholesale_price);
        } else if (clientSelected.type === 2) {/* business client -> wholesale */
            price = parseFloat(inventory.retail_price);
            if (typeof(inventory.clients_discount) != 'undefined') {                
	            if (typeof(inventory.clients_discount[clientSelected.id]) != 'undefined') {
	        		price = parseFloat(inventory.clients_discount[clientSelected.id].amount);
	        	}
            }
        }
        
        if (!isNaN(parseInt(variant_id)) && parseInt(variant_id) > 0) {
        	for (var index in inventory.variants) {
        		var variant = inventory.variants[index];
        		if (variant.id == parseInt(variant_id)) {
        			variant_value = parseFloat(variant.additional_cost);
        		}
        	}
        }

        price = price + variant_value;
        return price.toFixed(2);
    };
    
    model.get_discount_id_by_client_selected = function(inventory) {
    	var discount = 0;
    	var clientSelected = clientFactory.get_client_selected();
    	if(clientSelected.type === 2) {
            if (typeof(inventory.clients_discount[clientSelected.id]) != 'undefined') {
            	discount = inventory.clients_discount[clientSelected.id].id;
        	}
        }
    	return discount;
    };
    
    model.is_inventory_in_current_select_variant = function(inventory_id, variant_id) {
    	var clienSelected = clientFactory.get_client_selected();
    	for (var index in clienSelected.products) {
    		if (clienSelected.products[index].id == inventory_id) {
    			if (typeof(variant_id) != 'undefined') {
    				if (clienSelected.products[index].variant_id == variant_id) {
    					return true;
    				}
    			} else {
    				return true;
    			}
    		}
    	}
    	return false;
    };

    return model;
};