var DOMAIN = app.getDomain();
$(function() {
    var token = window.localStorage.getItem("rp-token");

    $('#search-redirect').live('click', loadCategories);
    $('#search').live('click', search);
    $('#back-index').on('click',backIndex)

    loadCategories();

    function loadCategories() {
        var url = DOMAIN + '/mobile/category/';
        $.ajax({
            url: url,
            type: 'POST',
            data: {
                rp_token: token
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
                $('#categories-list').append('<li><a id="search" data-id="0" href="#">without specifying</a></li>');
                $.each(data.categories, function(i, value) {
                    $('#categories-list').append('<li><a id="search" data-id="'+value.id+'" href="#">'+value.name+'</a></li>');
                });
                $('#categories-list').listview('refresh');
            },
           complete: function(){
                $.mobile.loading("hide");
           }
        });
    }

    function search(){
        var category = $(this).data('id'),
            text = $('#seach-text').val();

        var url = DOMAIN + '/mobile/search/';
        $.ajax({
            url: url,
            type: 'POST',
            data: {
                rp_token: token,
                category:category,
                text: text
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
                $.mobile.navigate("#pagina2");
                $('#result-search').html('');
                $.each(data.result, function(i, value) {

                    $.each(value.models, function(ind, model) {
                        if(model.photo.length > 0){
                            $('#result-search').append('<li><a class="add-to-group-btn" data-id="'+model.id+'" href="#product-group-list-page"><img src="'+DOMAIN+model.photo[0].thumb+'"></a></li>');
                        } else {
                            $('#result-search').append('<li><a class="add-to-group-btn" data-id="'+model.id+'" href="#product-group-list-page"><img src="http://royalpioneers.com/static/website/images/icon/default_product.png"></a></li>');
                        }
                    });
                });
                $('#categories-list').listview('refresh');
            },
           complete: function(){
                $.mobile.loading("hide");
           }
        });
    }
    function backIndex() {
        $.mobile.changePage('index.html',
         {
          allowSamePageTransition : true,
          transition : 'slide',
          showLoadMsg : true,
          reloadPage : true
         }
        );     
    }
});