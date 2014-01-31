// $(function(){

// 	var DOMAIN = app.getDomain(),
//         productModelId = undefined;

// 	// choose product group view

// 	function chooseProductGroup (callback_url) {
//         var $page = $('#product-group-list-page');
//         var list = $page.find('ul');
//         var html = '';
//         var url = DOMAIN + '/mobile/product-groups/';
//         var prev = '#product-detail-page';
//         var list = $page.find('ul').html('');
//         $.ajax({
//             method: 'GET',
//             url: url,
//             dataType: 'json',
//             data: {
//             	rp_token: window.localStorage['rp-token']
//             },
//             beforeSend: function(){
//                 $.mobile.loading("show", {
//                     textVisible: true,
//                     theme: 'c',
//                     textonly: false
//                 });
//             },
//             success: function (data) {
//             	if (data.status === 'success') {
//                     var ul_for_list_clients = $('#product-group-list-page').find('#list_groups'),
//                     html_to_insert = '',
//                     groups = data.groups;
//                     ul_for_list_clients.html('');
                    
//                     for(var i in groups){
//                         html_to_insert += '<li><a href="'+ prev +'" data-id="' + groups[i].id + '" class="group-for-choose">' + groups[i].name + '</a></li>';
//                     }
//                     ul_for_list_clients.append(html_to_insert);
//                     $('#list_groups').trigger('create');
//                     $('.group-for-choose').on('click', groupForChoose);
//                     $.mobile.navigate(callback_url);
	                
//             	} else {
//             		$.mobile.navigate(callback_url);
//             	}
//             },
//            complete: function(){
//                 $.mobile.loading("hide");
//            }
//         })
//     }

//     $('.add-to-group-btn').live('click', function (e) {
//     	e.preventDefault();
//         productModelId = $(this).data('id');
//     	var callback_url = $(this).attr('href');
//     	chooseProductGroup(callback_url);
//     });

//     // When make a click in group name, this is saved and the user will be redirected to previous page

//     function groupForChoose (e) {
//     	e.preventDefault();
//         var $this = $(this);
//         var url = DOMAIN + '/mobile/add-product-to-group/';
//         $.ajax({
//             url: url,
//             type: 'POST',
//             data: {
//                 productModelId: productModelId,
//                 groupId: $this.data('id'),
//                 rp_token: window.localStorage['rp-token']
//             },
//             dataType: 'json',
//             beforeSend: function(){
//                 $.mobile.loading("show", {
//                     textVisible: true,
//                     theme: 'c',
//                     textonly: false
//                 });
//             },
//             success: function (data) {
//                 if (data.status === 'success') {
//                     productModelId = undefined;
//                     $('#list_groups').trigger('create');
//                     $.mobile.navigate("#pagina2");
//                 } else {
//                 	alert(data.status);
//                 }
//             },
//            complete: function(){
//                 $.mobile.loading("hide");
//            }
//         });
//     }

//     $('.group-for-choose').on('click', groupForChoose);

// 	$('#form-add-group').on('click', function (e) {
// 		e.preventDefault();
// 		var $this = $(this);
// 		$.ajax({
// 			url: DOMAIN + '/mobile/product-group-create/',
// 			type: 'POST',
// 			data: {
// 				name: $('#form-group-name').val(),
// 				rp_token: window.localStorage['rp-token']
// 			},
// 			dataType: 'json',
// 			beforeSend: function(){
//                 $.mobile.loading("show", {
//                     textVisible: true,
//                     theme: 'c',
//                     textonly: false
//                 });
//             },
// 			success: function (data) {
// 				if (data.status === 'success') {
//                     var callback_url = '#product-group-list-page';
//     	            chooseProductGroup(callback_url);
// 				}
// 			},
//            complete: function(){
//                 $.mobile.loading("hide");
//            }
// 		});
// 	});
// });
