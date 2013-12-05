var ClientModel = function(countryFactory, stateFactory, cityFactory, clientFactory) {
	var model= this;
	model.messages = [];
	model.id_city_autocomplete = 'id_city_autocomplete';
	model.id_template_option_city = 'id_template_option_city';
	model.id_client_list = 'list_clients';
	model.id_template_option_city = 'id_template_option_city';
	model.id_item_template = 'id_client_template';
	model.id_btn_return = 'return_from_add_new_client';
	model.id_btn_create = 'add_new_client';
	model.id_page_new_client = 'pagina9';
	model.id_client_selected = 'clientSelected';
	model.class_item_city = 'class_item_city';
	
	model.countryFactory = countryFactory;
	model.stateFactory = stateFactory;
	model.cityFactory = cityFactory;
	model.clientFactory = clientFactory;
	
	model.city_selected = 0;
	
	model.init = function(cache) {		
		$("#"+model.id_btn_create).live("click", model.create);
		if(!(model.get_form_field('country') === undefined)){
			model.get_form_field('country').live("change", model.charge_states);
			model.get_form_field('state').live("change", model.charge_cities);
			$('.'+model.class_item_city).live('click', model.set_city_selected);	
			//$.mobile.listview.prototype.options.filterCallback = model.filter_cities;
		}				
		/* model.list(); */
		
		/* start address */
		model.start_form_values(cache);
	};
	
	model.getDataAddressClient = function(){	
		model.countryFactory.get_all(function(countries){
			for (var i in countries) {
				var country = countries[i];
				model.stateFactory.get_by_country(country.id, function(states){
					for(var j in states){
						var state = states[j];
						model.cityFactory.get_by_char(state.id, function(){});
					}
				});
			};
		});		
    };

	model.filter_cities = function(text, searchValue, item) {
		if (searchValue.length < 3 || text.toString().toLowerCase().indexOf( searchValue ) === -1) {
			return true;
		}
		return false;
	};
	
	
	model.start_form_values = function(cache){
		model.start_countries_values();
        //1
		model.start_company_type_values(cache);
	};
	
	model.start_countries_values = function(cache){
		/* countries */
		model.countryFactory.get_all(function(countries){
			if (model.get_form_field('country') !== undefined) {
				model.get_form_field('country').html('');	
			};			
			model.render_field_form('country', {id:'', name:'Select Country'});
			for (var index in countries) {
				country = countries[index];
				model.render_field_form('country', country);
			}
			try {model.get_form_field('country').selectmenu('refresh', true);}catch(e){}
		}, cache);
	};
	
	model.start_company_type_values = function(cache) {
		/* items */
		model.clientFactory.get_company_types(function(items) {
			//3
			var form = model.get_form_field('company_type');
            if(form != undefined){
                form.html('');
            }
			model.render_field_form('company_type', {id:'', name:'Select Type'});
			for (var index in items) {
				item = items[index];
				model.render_field_form('company_type', item);
			}
			
			try {model.get_form_field('company_type').selectmenu('refresh', true);}catch(e){}
		}, cache);
	};
	
	model.get_form_field  = function(field){
		if (field == 'city'){
			var select = $('#'+model.id_city_autocomplete).find('ul')[0];
			return $(select);
		}
		if($("#"+model.id_page_new_client).length > 0){
			field_select = $("#"+model.id_page_new_client).find('form')[0][field];
			return $(field_select);
		}		
	};
	
	model.render_field_form = function(field, item_to_render, label_name){
		if (typeof(label_name) == 'undefined') {
			label_name = 'name';
		}
		var field_select = model.get_form_field(field);
		var option = $('<option></option>');
		option.attr('value', item_to_render.id);
		option.html(item_to_render[label_name]);
        if(field_select != undefined){
            field_select.append(option);
        }
	};
	
	model.create = function(e){
		e.preventDefault();
		model.messages = [];
		var form = $('#'+model.id_page_new_client).find('form')[0];
		var params = model.get_form_params(form);
		if (!params) {
			model.show(model.messages);
		} else {
			model.clientFactory.create(params, function(data, errors){
				if (data === false) {
					model.messages[model.messages.length] = errors;
					model.show(model.messages);
				} else {
					model.set_client_to_list(data);
					
					/* TODO: uncomment when code pass to client */
					/* model.apply_event_select(); 
					model.refresh_list(); */
					model.clear_form(5);
					$.mobile.navigate("#pagina11");
					/* model.success_create(); */
				}
			});
			
			//create a client storage
			if(Offline.state === 'down'){
				
				var allClients = JSON.parse(localStorage.getItem('allClients'));
				var newClientOffline = {
					id: 0,
					name: params.name, 
					image: "images/designer_default_photo.jpg", 
					type: params.company_type
				};
				allClients.push(newClientOffline);
				localStorage.setItem("allClients", JSON.stringify(allClients));
				model.set_client_to_list(newClientOffline);		
		        model.clear_form(5);
				$.mobile.navigate("#pagina11");
	        }
		}
	}
	model.get_form_params = function(form) {
		params = {};
		params.company_type = form.company_type.value;
		if (params.company_type < 1) {
			model.messages[model.messages.length] = 'Invalid type';
			return false;
		}
		params.name = form.name.value;
		if (params.name.length < 1) {
			model.messages[model.messages.length] = 'Invalid name';
			return false;
		}
		params.address = form.address.value;
		if (params.address.length < 1) {
			model.messages[model.messages.length] = 'Invalid address';
			return false;
		}
		params.email = form.email.value;
		if (params.email.length < 7 || params.email.indexOf('@') == -1 || params.email.indexOf('.') == -1) {
			model.messages[model.messages.length] = 'Invalid email';
			return false;
		}
		params.city = model.city_selected;
		if (params.city < 1) {
			model.messages[model.messages.length] = 'Invalid city';
			return false;
		}
		
		return params;
	};
	
	model.success_create = function() {
		$('#'+model.id_btn_return).trigger('click');
	};
	
	model.show = function(messages) {
		var str = '';
		for (var message in messages) {
			var message = messages[message];
			str += message + '\n';
		}
		alert(str);
	};
		
	/* LIST */
	model.list = function() {
		model.clientFactory.get_all(function(clients){
			window.localStorage.setItem(model.id_client_list, JSON.stringify(clients));
			model.render_client_list();
		});
	};
	
	model.render_client_list = function() {
		var client_list = JSON.parse(window.localStorage.getItem(clientFactory.id_client_list));
		$('#'+model.id_client_list).html('');
		for (var index in client_list) {
			var client = client_list[index];
			model.set_client_to_list(client);
		}
		model.refresh_list();
	};

	model.set_client_to_list = function(client) {
				
		var item_template = $('#'+model.id_item_template).html();
		item_template = item_template.replace(/__name__/g, client.name);
		item_template = item_template.replace(/__id__/g, client.id);
		item_template = item_template.replace(/__image__/g, client.image);
		if(Offline.state === 'down'){
			item_template = item_template.replace(/__clientOffline__/g, 'disabled');	
		}
		
        $('#'+model.id_client_list).append(item_template);
        $('#'+model.id_client_list).trigger('create');
	};

	model.refresh_list = function() {
		try {$('#'+model.id_client_list).trigger('create');}catch(e){}
	};
	
	model.apply_event_select = function() {
		// TODO: migrate call methods
	};
	
	/* FORM */
	model.charge_states = function(e){
		e.preventDefault();
		var country_id = model.get_form_field('country').find('option:selected').attr('value');
		model.render_states(country_id);
	};
	
	model.render_states = function(country_id) {
		model.stateFactory.get_by_country(country_id, function(states){
			model.clear_form(2);
			model.render_field_form('state', {id:'', name:'Select'});
			for (var index in states) {
				state = states[index];
				model.render_field_form('state', state);
			}
			try{model.get_form_field('state').selectmenu('refresh', true);}catch(e){}
		});
	};
	
	model.charge_cities = function(e) {
		e.preventDefault();
		var state_id = model.get_form_field('state').find('option:selected').attr('value');
		model.render_cities(state_id);
	};
	
	model.render_cities = function(state_id) {
		model.cityFactory.get_by_char(state_id, function(cities){
			model.clear_form(1);
			for (var index in cities) {
				citie = cities[index];
				model.render_city_to_list(citie);
			}
			try{model.get_form_field('city').trigger('refresh');}catch(e){}
		});
	};
	
	model.render_city_to_list = function(city){
		var li = $('#'+model.id_template_option_city).html();
		li = li.replace(/__id__/g, city.id);
		li = li.replace(/__name__/g, city.name);
		model.get_form_field('city').append(li);
	};
	
	model.clear_form = function(lvl) {
		model.city_selected = 0;
		if (lvl > 0) {
			var select = model.get_form_field('city');
			select.html('');
			try {select.trigger('refresh');}catch(e){}
			
		}
		if (lvl > 1) {
			var select = model.get_form_field('state');
			select.html('');
			try {select.selectmenu('refresh', true);}catch(e){}
		}
		if (lvl > 2) {
			model.start_countries_values(window.localStorage.getItem("rp-cache"));
		}
		if (lvl > 3) {
			model.start_company_type_values(window.localStorage.getItem("rp-cache"));
		}
		if (lvl > 4) {
			model.get_form_field('name').attr('value', '');
			model.get_form_field('email').attr('value', '');
			model.get_form_field('address').attr('value', '');
			$('#'+model.id_city_autocomplete).find('div input')[0].value = '';
		}
	};
	
	model.set_city_selected = function(e){
		model.city_selected = $(e.target).attr('data-value');
		city_name = $(e.target).html();
		$('#'+model.id_city_autocomplete).find('imput')[0];
		$('#'+model.id_city_autocomplete).find('div input')[0].value = city_name;
		$($('#'+model.id_city_autocomplete).find('div input')[0]).trigger('keyup');
	};
 	
	return model;
};
