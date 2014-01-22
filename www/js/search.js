var DOMAIN = app.getDomain();
$(function() {
    var token = window.localStorage.getItem("rp-token");

    $('#search-redirect').live('click', loadCategories);
    $('#search').live('click', search);
    $('#back-index').live('click', changeIndex);
    $('#form_search_without_category').live('submit', formSearch_WithoutCategory);
    loadCategories();

    function changeIndex() {
        window.location.replace("index.html");
    }

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
                loader();
            },
            success: function(data) {
                $('#categories-list').append('<li><a id="search" data-id="0" href="#">without specifying</a></li>');
                $.each(data.categories, function(i, value) {
                    $('#categories-list').append('<li><a id="search" data-id="'+value.id+'" href="#">'+value.name+'</a></li>');
                });
                $('#categories-list').listview('refresh');
            },
           complete: function(){
               try{$.mobile.loading("hide");}catch(e){}
           }
        });
    }

    function formSearch_WithoutCategory(){        
        localStorage.searchWithoutCategory = true;
        search();
    }

    function search(){
        var text = $('#seach-text').val(),
            category;
        if(localStorage.searchWithoutCategory){
            category = 0;
            localStorage.searchWithoutCategory = false;
        }
        else{
            category = $(this).data('id');
        }
        
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
                loader();
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
               try{$.mobile.loading("hide");}catch(e){}
           }
        });
    }

    function loader(){
        try{$.mobile.loading("show", {
            textVisible: true,
            theme: 'c',
            textonly: false
        });}catch(e){}
    }   
});