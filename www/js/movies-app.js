$(function(){

	var DOMAIN = app.getDomain();

	function setContentSize() {
		$('.swiper-content').css({
			height: $(window).height()-$('.swiper-nav').height()
		})
	}
	setContentSize();
	$(window).resize(function(){
		setContentSize();
	});

	//Swiper Content
	var contentSwiper = $('.swiper-content').swiper({
		onSlideChangeStart: function(){
			updateNavPosition()
		}
	});
	//Nav
	var navSwiper = $('.swiper-nav').swiper({
		visibilityFullFit: true,
		slidesPerView:'auto',
		//Thumbnails Clicks
		onSlideClick: function(){
			contentSwiper.swipeTo( navSwiper.clickedSlideIndex )
		}
	})

	//Update Nav Position
	function updateNavPosition(){
		$('.swiper-nav .active-nav').removeClass('active-nav')
		var activeNav = $('.swiper-nav .swiper-slide').eq(contentSwiper.activeIndex).addClass('active-nav')
		if (!activeNav.hasClass('swiper-slide-visible')) {
			if (activeNav.index()>navSwiper.activeIndex) {
				var thumbsPerNav = Math.floor(navSwiper.width/activeNav.width())-1
				navSwiper.swipeTo(activeNav.index()-thumbsPerNav)
			}
			else {
				navSwiper.swipeTo(activeNav.index())
			}	
		}
	}

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
	                document.location.href = callback_url;
            	} else {
            		alert('no groups found');
            	}
            }
        })
    }

    $('#add-to-group-btn').on('click', function (e) {
    	e.preventDefault();
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
                productModelId: window.localStorage['productModelId'],
                groupId: $this.data('id'),
                rp_token: window.localStorage['rp-token']
            },
            dataType: 'json',
            success: function (data) {
                if (data.status === 'success') {
                    delete window.localStorage['productModelId'];
                    document.location.href = $this.attr('href');
                } else {
                	alert(data.status);
                }
            }
        });
    }

    $('.group-for-choose').on('click', groupForChoose);

	$('.product-link').on('click', function (e) {
		e.preventDefault();
		var $this = $(this);
		var id = $this.data('id');
		window.localStorage['productModelId'] = id;
		var url = '';
		var $detailPage = $('#product-detail-page');
		$detailPage.find('h1').text('fooo');
		var detail = '#product-detail-page';
		document.location.href = detail;
		// TODO: add ajax for get product detail by ajax
	});

	$('#form-add-group').on('submit', function (e) {
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
			success: function (data) {
				if (data.status === 'success') {
					document.location.href = '#product-group-list-page';
				}
			}
		});
	});
});
