$(function(){

	var DOMAIN = app.getDomain(),
        productModelId = undefined;

	// choose product group view

	function chooseProductGroup (callback_url) {
        var $page = $('#product-group-list-page');
        var list = $page.find('ul');
        var html = '';
        var url = DOMAIN + '/mobile/product-groups/';
        var prev = '#product-detail-page';
        var list = $page.find('ul').html('');
        $.ajax({
            method: 'GET',
            url: url,
            dataType: 'json',
            data: {
            	rp_token: window.localStorage['rp-token']
            },
            beforeSend: function(){
                $.mobile.loading("show", {
                    textVisible: true,
                    theme: 'c',
                    textonly: false
                });
            },
            success: function (data) {

            	if (data.status === 'success') {
            		var len = data.groups.length, i, group;
	                for (i=0; i<len; i++) {
	                    group = data.groups[i];
	                    html += '<li data-icon="false"><a href="'+ prev +'" data-id="' + group.id + '" class="group-for-choose">' + group.name + '</a></li>'
	                }
	                list.append(html);
	                list.trigger('create');
	                $('.group-for-choose').on('click', groupForChoose);
	                $.mobile.navigate(callback_url);
            	} else {
            		alert('no groups found');
            	}
            },
           complete: function(){
                $.mobile.loading("hide");
           }
        })
    }

    $('.add-to-group-btn').live('click', function (e) {
    	e.preventDefault();
        productModelId = $(this).data('id');
    	var callback_url = $(this).attr('href');
    	chooseProductGroup(callback_url);
    });

    // When make a click in group name, this is saved and the user will be redirected to previous page

    function groupForChoose (e) {
    	e.preventDefault();
        var $this = $(this);
        var url = DOMAIN + '/mobile/add-product-to-group/';
        $.ajax({
            url: url,
            type: 'POST',
            data: {
                productModelId: productModelId,
                groupId: $this.data('id'),
                rp_token: window.localStorage['rp-token']
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
                if (data.status === 'success') {
                    productModelId = undefined;
                    $.mobile.navigate("#pagina2");
                } else {
                	alert(data.status);
                }
            },
           complete: function(){
                $.mobile.loading("hide");
           }
        });
    }

    $('.group-for-choose').on('click', groupForChoose);

	$('#form-add-group').on('click', function (e) {
		e.preventDefault();
		var $this = $(this);
		$.ajax({
			url: DOMAIN + '/mobile/product-group-create/',
			type: 'POST',
			data: {
				name: $('#form-group-name').val(),
				rp_token: window.localStorage['rp-token']
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
				if (data.status === 'success') {
                    var callback_url = '#product-group-list-page';
    	            chooseProductGroup(callback_url);
				}
			},
           complete: function(){
                $.mobile.loading("hide");
           }
		});
	});
});
