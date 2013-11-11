var DOMAIN = app.getDomain();

$(function() {
    var token = window.localStorage.getItem("rp-token");

    loadCategories();

    $('#search').live('click', search);

    function loadCategories() {
        var url = DOMAIN + '/mobile/category/';
        $.ajax({
            url: url,
            type: 'POST',
            data: {
                rp_token: token
            },
            dataType: 'json',
            success: function (data) {
                $('#categories-list').append('<li><a id="search" data-id="0" href="#">without specifying</a></li>');
                $.each(data.categories, function(i, value) {
                    $('#categories-list').append('<li><a id="search" data-id="'+value.id+'" href="#">'+value.name+'</a></li>');
                });
                $('#categories-list').listview('refresh');
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
            success: function (data) {
                $.mobile.navigate("#pagina2");

                $.each(data.result, function(i, value) {

                    $.each(value.models, function(ind, model) {
                        if(model.photo.length > 0){
                            $('#result-search').append('<li><img src="'+DOMAIN+model.photo[0].thumb+'"></li>');
                        } else {
                            $('#result-search').append('<li><img src="http://royalpioneers.com/static/website/images/icon/default_product.png"></li>');
                        }
                    });
                });
                $('#categories-list').listview('refresh');
            }
        });
    }
});