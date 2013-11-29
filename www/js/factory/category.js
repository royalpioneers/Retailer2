var CategoryFactory = function(urls, token) {
	var factory = {};
	factory.urls = urls;
	factory.token = token;
	factory.cache = false;


	factory.get_all = function(handler, cache) {

	};

    factory.set_token = function(token) {
		factory.token = token;
	};
}