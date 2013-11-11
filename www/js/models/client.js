var ClientModel = function(urls, token) {
	var model= this;
	model.cache = true,
	model.messages = [],
	model.token = token,
	model.id_client_list = 'list_clients',
	model.id_item_template = 'id_client_template',
	model.id_btn_return = 'return_from_add_new_client',
	model.id_btn_create = 'add_new_client',
	model.url = urls;
	
	model.init = function() {
		$("#"+model.id_btn_create).live("click", mode.create);
		model.list();
	};
	
	model.create = function(e){
		e.preventDefault();

		model.messages = [];
		var form = $(e.target).parent()[0];
		var params = model.get_form_params(form);
		params.rp_token = model.token;
		if (!params) {
			model.show(model.messages);
		} else {
			$.ajax({
				url: model.url.client_create,
				type: 'POST',
				data: params,
				dataType: 'json',
				success: function(data){
					console.log(data);
					if (data.stattus = 'ok') {
						model.store_client(data.client);
						model.set_client_to_list(data.client);
						model.refresh_list();
						model.success_create();
					} else {
						model.show(data.errors);
					}
				}
		    });
		}
	};
	
	model.get_form_params = function(form) {
		params = {};
		params.name = form.name.value;
		params.address = form.address.value;
		params.email = form.email.value;
		return params;
	};
	
	model.success_create = function() {
		$('#'+model.id_btn_return).trigger('click');
	};
	
	model.show = function(messages) {
		var str = '';
		for (message in messages) {
			str += message + '\n';
		}
		alert(str);
	};
	
	model.store_client = function(client){
		var client_list = JSON.parse(window.localStorage.getItem(model.id_client_list));
		client_list.append(client);
		window.localStorage.setItem(model.id_client_list, JSON.stringify(client_list));
	};
	
	model.list = function() {
		window.localStorage.removeItem(model.id_client_list);
		var client_list = JSON.parse(window.localStorage.getItem(model.id_client_list));
		if (model.cache && client_list != null) {
			return true;
		}
		
		$.ajax({
			url: model.url.client_list,
			type: 'POST',
			data: {rp_token: model.token},
			dataType: 'json',
			success: function(data){
				if (data.status = 'ok') {
					window.localStorage.setItem(model.id_client_list, JSON.stringify(data.list));
					model.render_client_list();
				} else {
					model.show(data.errors);
				}
			}
	    });
	};
	
	model.render_client_list = function() {
		var client_list = JSON.parse(window.localStorage.getItem(model.id_client_list));

		$('#'+model.id_client_list).html('');
		for (var index in client_list) {
			var client = client_list[index];
			model.set_client_to_list(client);
		}
		model.refresh_list();
	};

	model.set_client_to_list = function(client) {
		var item_template = $('#'+model.id_item_template).html();
		item_template = item_template.replace('__name__', client.name);
		item_template = item_template.replace('__image__', client.image);
        $('#'+model.id_client_list).append(item_template);
	};
 
	model.refresh_list = function() {
		$('#'+model.id_client_list).listview("refresh");
	};
};
