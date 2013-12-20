var FeatureFactory = function(urls, token) {
	var factory = {};
    var self = factory;
	factory.urls = urls;
	factory.token = token;
	factory.cache = false;


	factory.getFeatures = function(handler, cache, idProduct) {
        var url = factory.urls.features.replace('__idModel__', idProduct);
        $.ajax({
            url: url,
            type: 'POST',
            data: {
                rp_token: factory.token,
                model_id: idProduct
            },
            dataType: 'json',
            beforeSend: function(){
                $.mobile.loading("show", {
                    textVisible: true,
                    theme: 'c',
                    textonly: false
                });
            },
            success: function(data) {
                if(data.status == true) {           
                    handler(data.features);
                } else {
					return handler([], []);
				}
            },
            error: function(err) {
                /* Act on the event */
            },
            complete: function(){
                $.mobile.loading("hide");
            }
	    });
    };

    factory.getValuesFeatures = function(handler, cache, idProduct, idFeature) {        
        var url = factory.urls.valuesFeatures.replace('__idModel__', idProduct).replace('__idFeature__', idFeature);
        debugger;
        $.ajax({
            url: url,
            type: 'POST',
            data: {
                rp_token: factory.token,
                model_id: idProduct
            },
            dataType: 'json',
            beforeSend: function(){
                $.mobile.loading("show", {
                    textVisible: true,
                    theme: 'c',
                    textonly: false
                });
            },
            success: function (data) {
                debugger;                
                if(data.status == true) {           
                    handler(data.values_features);
                } else {
                    return handler([], []);
                }
            },
            complete: function(){
                $.mobile.loading("hide");
            }
        });
	};

    factory.set_token = function(token) {
		factory.token = token;
	};

    return factory;
};