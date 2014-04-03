var FeatureFactory = function(urls, token) {
	var factory = {};
    var self = factory;
	factory.urls = urls;
	factory.token = token;
	factory.cache = false;


	factory.getFeatures = function(handler, cache, idProductModel) {
        var url = factory.urls.features.replace('__idModel__', idProductModel);
        $.ajax({
            url: url,
            type: 'POST',
            data: {
                rp_token: factory.token,
                id_product_model: idProductModel
            },
            dataType: 'json',
            beforeSend: function(){
                loader();
            },
            success: function(data) {
                if(data.status == true) {           
                    handler(data.features);
                } else {
					return handler([], []);
				}
            },
            complete: function(){
               try{$.mobile.loading("hide");}catch(e){}
           }
	    });
    };

    factory.getValuesFeatures = function(handler, cache, idProductModel, idFeature) {        
        var url = factory.urls.valuesFeatures.replace('__idModel__', idProductModel).replace('__idFeature__', idFeature);
        $.ajax({
            url: url,
            type: 'POST',
            data: {
                rp_token: factory.token,
                id_product_model: idProductModel
            },
            dataType: 'json',
            beforeSend: function(){
                loader();
            },
            success: function (data) {                     
                if(data.status == true) {     
                    // alert('Success!');      
                    handler(data.values_features);
                } else {
                    return handler([], []);
                }
            },
            complete: function(){
               try{$.mobile.loading("hide");}catch(e){}
           }
        });
	};

    factory.set_token = function(token) {
		factory.token = token;
	};

    factory.create_sub_variant = function(idProductModel,
    									idFeature,
    									idFeatureValue,
    									additionalCost,
    									variantQuantity,
    									handler){

        $.ajax({
            url: factory.urls.saveProductModelVariant,
            type: 'POST',
            dataType: 'json',
            data: {
                rp_token: factory.token,
                id_product_model: idProductModel,
                feature_id: idFeature,
                feature_value_id: idFeatureValue,
                additional_cost : additionalCost,
                quantity: variantQuantity
            },
            beforeSend: function(){
                loader();
            },
            success: function(data){              
                if (data.status){
                    var str = 'Success!';
                    showAlert(str);
                    $('#browser').val(''),
                    $('#name-variant').val(''),
                    $('#category-id').text(''),
                    $('#quantity').val(''),
                    $('#sku').val(''),
                    $('#cost-price').val(''),
                    $('#wholesale-price').val(''),
                    $('#retail-price').val('');
                    $('#values-features-list').html('');
                    $('#featureName').html('');
                    $('#featureValueName').text('');
                    $('#additionalCost').val('');
                    $('#variantQuantity').val('');
                    handler(data);
                }else{
                    var str = 'fail!';
                    showAlert(str);
                }
            },
            complete: function(){
                try{$.mobile.loading("hide");}catch(e){}
            }
        });
    };

    // factory.getAllTheFeaturesByBuyer = function(){
    //     $.ajax({
    //         url: factory.urls.getAllTheFeaturesByBuyer,
    //         type: 'POST',
    //         dataType: 'json',
    //         data: {
    //             rp_token: factory.token
    //         },
    //         beforeSend: function(){
    //             loader();
    //         },
    //         success: function(data){                            
    //             if (data.status){
    //                 alert('Success!');
    //             };
    //         },
    //         complete: function(){
    //             try{$.mobile.loading("hide");}catch(e){}
    //         }
    //     });
    // };

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

function showAlert (str) {    
    $('.infoAlert').find('h3').text('');
    $('.infoAlert').find('h3').text(str).end().fadeIn().children().addClass('effect_in_out');
}

$('.infoAlert').live('click', btn_accept_option);

function btn_accept_option(){    
    $('.infoAlert').fadeOut().children().removeClass('effect_in_out');
}