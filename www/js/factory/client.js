var ClientFactory = function(urls, token, cache) {
	var factory = {};
	factory.urls = urls;
	factory.token = token;
	factory.id_company_types = 'id_company_types';
	factory.id_client_list = 'clients';
	factory.cache = cache;
	factory.storage_id_client_selected = 'clientSelected';
	
	factory.get_all = function(handler, cache) {
		
        var client_list = JSON.parse(window.localStorage.getItem(factory.id_client_list));
		if ((factory.cache || cache) && client_list != null) {
			return handler(client_list);
		}
		
		$.ajax({
			url: factory.urls.client_list,
			type: 'POST',
			data: {rp_token: factory.token},
			dataType: 'json',
			beforeSend: function(){
                factory.loader();
            },
			success: function(data){
				if (data.status == 'ok') {
					window.localStorage.setItem(factory.id_client_list, JSON.stringify(data.list));
					handler(data.list);
				} else {
					handler([]);
				}
			},
           complete: function(){
                try{$.mobile.loading("hide");}catch(e){}
           }
	    });
	};
	
	factory.create = function(params, handler) {
		params.rp_token = factory.token;
		$.ajax({
			url: factory.urls.client_create,
			type: 'POST',
			data: params,
			dataType: 'json',
			beforeSend: function(){
                factory.loader();
            },
			success: function(data){
				if (data.status == 'ok') {
					data.client.name = params.name;
					data.client.image = DOMAIN+'/static/img/designer_default_photo.jpg';
					data.client.type = params.company_type;
					factory.store_client(data.client);
					handler(data.client);
				} else {
					handler(false, data.messages);
				}
			},
           complete: function(){
                try{$.mobile.loading("hide");}catch(e){}
           }
	    });
	};
	
	factory.store_client = function(client){
		if(window.localStorage.getItem(factory.id_client_list)){
			var client_list = JSON.parse(window.localStorage.getItem(factory.id_client_list));
			client_list[client_list.length] = client;
			window.localStorage.setItem(factory.id_client_list, JSON.stringify(client_list));
		}
	};
	
	factory.get_company_types = function(handler, cache){
        //2
        
		var types_list = JSON.parse(window.localStorage.getItem(factory.id_company_types));
		if (cache && types_list != null) {
			return handler(types_list);
		}
		
		$.ajax({
			url: factory.urls.client_company_types,
			type: 'POST',
			data: {rp_token: factory.token},
			dataType: 'json',
			beforeSend: function(){
                factory.loader();
            },
			success: function(data){
				if (data.status == 'ok') {
					window.localStorage.setItem(factory.id_company_types, JSON.stringify(data.list));
					handler(data.list);
				} else {
					handler([]);
				}
			},
			error: function(err){
				
			},
           complete: function(){
                try{$.mobile.loading("hide");}catch(e){}
           }
	    });
	};
	
	factory.set_token = function(token) {
		factory.token = token;
	};
	
	factory.get_client_selected = function() {
		// var clientSelected = JSON.parse(localStorage.getItem(factory.storage_id_client_selected));
		return [];
	};

	factory.set_client_selected = function(client) {
		localStorage.setItem(factory.storage_id_client_selected, JSON.stringify(client));
	};

	factory.loader = function(){
		try{$.mobile.loading("show", {
            textVisible: true,
            theme: 'c',
            textonly: false
        });}catch(e){}
	}
	
	return factory;
};