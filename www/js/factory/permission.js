var PermissionFactory = function(urls, token, cache) {
	var factory = {};

	factory.cache = cache;
	factory.urls = urls;
	factory.token = token;
	factory.id_store_permissions = 'id_store_permissions';
	
	factory.get_all = function(handler, cache) {
		if (typeof(cache) == 'undefined') {
			cache = window.eval(factory.cache);
		}
		var list = JSON.parse(window.localStorage.getItem(factory.id_store_permissions));
		if ((cache) && list != null) {
			return handler(list);
		}
		$.ajax({
			url: factory.urls.permissions,
			type: 'POST',
			data: {rp_token: factory.token},
			dataType: 'json',
			async: false,
			success: function(data){
				if (data.status == 'ok') {
					window.localStorage.setItem(factory.id_store_permissions, JSON.stringify(data.list));
					handler(data.list);
				} else {
					return handler([]);
				}
			},
	    });
	};
	
	factory.get_current_permissions = function () {
		if (window.localStorage.getItem(factory.id_store_permissions) == null) {
			return [];
		}
		var list = JSON.parse(window.localStorage.getItem(factory.id_store_permissions));
		if (list != null) {
			return list;
		}
		return [];
	}
	
	factory.set_token = function(token) {
		factory.token = token;
	};
	
	return factory;
};
