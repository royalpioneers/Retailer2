var CategoryFactory = function(urls, token) {
	var factory = {};
    var self = factory;
	factory.urls = urls;
	factory.token = token;
	factory.cache = false;


	factory.get_main_category = function(handler, cache) {
        
        var prdData = JSON.parse(window.localStorage.getItem('productRelated'));
        var catData = JSON.parse(window.localStorage.getItem('categories'));
        if ((factory.cache || cache) && catData != '' && prdData != '') {
		    return handler(prdData, catData);
		}
        $.ajax({
            url: factory.urls.productInformation,
            type: 'POST',
            data: {
                rp_token: factory.token
            },
            dataType: 'json',
            beforeSend: function(){
                loader();
            },
            success: function(data) {                
                if(data.status == true) {
                    window.localStorage.removeItem("productRelated");
                    window.localStorage.removeItem("categories");
                    window.localStorage.setItem('productRelated', JSON.stringify(data.products));
                    window.localStorage.setItem('categories', JSON.stringify(data.categories));
                    handler(data.products, data.categories);
                } else {
					return handler([], []);
				}
            },
            complete: function(){
               try{$.mobile.loading("hide");}catch(e){}
           }
	    });
    };

    factory.search_by_id = function(id){
        var catData = JSON.parse(window.localStorage.getItem('categories')),
            catSelected = undefined;
        $.each(catData, function(i, value){
            if(value.id == id){
                catSelected = value;
            }
        });
        return catSelected;
    };

    factory.get_sub_category = function(handler, cache, main, collapse) {
        var subCategory = self.search_by_id(main);
        if ((factory.cache || cache) && subCategory != null && subCategory != undefined) {
            return handler(catData, collapse);
        }

        $.ajax({
            url: factory.urls.category,
            type: 'POST',
            data: {
                rp_token: factory.token,
                id: main
            },
            dataType: 'json',
            beforeSend: function(){
                loader();
            },
            success: function (data) {
                handler(data.categories, collapse);

            },
            complete: function(){
               try{$.mobile.loading("hide");}catch(e){}
           }
        });
	};

    factory.set_token = function(token) {
		factory.token = token;
	};

    function loader(){
        try{
            $.mobile.loading("show", {
                textVisible: true,
                theme: 'c',
                textonly: false
            });
        }catch(e){}
    }
    return factory;
};