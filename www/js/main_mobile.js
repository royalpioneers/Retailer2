$(window).load(function() {
    var run = function(){
    if (Offline.state === 'up')
    Offline.check();
    }
    setInterval(run, 5000);
    setTimeout(function(){
        init();
    },1000);
});


/*
Storages

buyerInventory: stores all the products shown in the inventory list
rp-token: Used in requests for user verification
items_list: ?
productsSelected: ?
storageClients: ?
productRelated: contains product names selected product
categories: contains categories and sub categories
 */

var DOMAIN = app.getDomain();

var urls = {
    'login': DOMAIN+'/mobile/login_buyer/',
    'loginToken': DOMAIN+'/mobile/login_buyer_token/',
    'inventory': DOMAIN+'/mobile/inventory/',
    'clients_list': DOMAIN+'/mobile/clients-list/',
    'analyzer':DOMAIN+'/mobile/analyzer-information/',
    'saveProduct': DOMAIN+'/mobile/create/product/',
    'productInformation': DOMAIN+'/mobile/product-information/',
    'category':DOMAIN+'/mobile/category/',
    'upload': DOMAIN+'/mobile/upload-image/product/',
    'client_create': DOMAIN+'/mobile/client/create/',
    'client_list': DOMAIN+'/mobile/client/list/',
    'client_company_types': DOMAIN+'/mobile/client/company_types/',
    'countries': DOMAIN+'/mobile/countries/',
    'states_by_country': DOMAIN+'/mobile/states_by_country/',
    'cities_by_char': DOMAIN+'/mobile/cities_by_char/',
    'send_invoice': DOMAIN+'/mobile/buyer-inventory-create-sale/'
};
var items_list = [], productsSelected = [], storageClients = [];

function init() {
    console.log(Offline.state+'jonath');
    var analyzer_information_time = new Date();
    	analyzer_information = [],
        imageURL = undefined;
        token = window.localStorage.getItem("rp-token");

    //Events

        //Login
        $("#log_in").on("click", loginAuth);
        $('#logout').on('click', logOut);

        //Generic
        $(".navbar ul li").live("click", changeTab);
        $('.carousel').carousel({interval: 2000});

        //Create product
        $('.categories_create_product').find('a').on('click', createProduct);
        $('#create-product').live("click", getInformationProduct);
        $('#create_item').live("click", saveProduct);
        $('.option-expand').live('expand', setCategory);
        $('#edit-image').on('click', takePicture);

        //Analyzer
        $("#browser").live('input', getCompleteInformation);
        $('.overlay,.close_modal').live('click', showOverlay);
        $('#graphic_month').live('click',function(){processAnalyzerInformation(1);});
        $('#graphic_week').live('click',function(){processAnalyzerInformation(2);});
        $('#graphic_day').live('click',function(){processAnalyzerInformation(3);});
        $('.card').on('click',function(){$(this).addClass('moved');});

        //Invoice
        $('#new_invoice').live('click', listClients);
        $('#goToInvoice').live('click', showInvoice);
        $('.productSelected').live('click', selectProduct);
        $( "#pagina12" ).on( "pageshow", function( event ) {$('#theDate').val(getDateMonthYear());});
        $('#goToProducts').on('click', goProduct);
        $( "#pagina13" ).on( "pageshow", pageClientShow);
        $('.saveClientStorage').on('click', saveClientStorage);
        $('.removeProduct').live('click', removeMyProduct);
        $( "#pagina12" ).on( "pageshow", pageMyProductsShow);
        $( ".qtyInvoice" ).live('keyup', updateMyProduct);
        $('#sendProductsInvoice').live('click', sendProductsInvoice);
        $('.cancel_sendProductsInvoice').live('click', goProduct);
        $('.cleanClientSelected').live('click', cleanClientSelected);
        $('#search-redirect').on('click', changeSearch);
        $('#back_page').live('click', redirectToPage);
        $('#selectClient-menu').find('li').live('click', moveToOtherClient);
        $('.kill_storage').live('click', killStorage);

    /* PRODUCTS */
        var categoryFactory = new CategoryFactory(urls, token);
        var buyerInventoryFactory = BuyerInventoryFactory(urls, token);
        var product = ProductModel(categoryFactory);
        product.init();/* start list */

    /* CLIENT */
        var countryFactory = new CountryFactory(urls, token);
        var stateFactory = new StateFactory(urls, token);
        var cityFactory = new CityFactory(urls, token);
        var clientFactory = new ClientFactory(urls, token);
        var client = new ClientModel(countryFactory, stateFactory, cityFactory, clientFactory, listClients);
        client.init(); /* start list */                     

    /* INVOICE */
        var invoice = new InvoiceModel();


    //Automatic Login

    if(token != null) {
        authToken();
    } else {
        $('#container-login').css('display','inline');
    }

    $.mobile.selectmenu.prototype.options.nativeMenu = false;

    $.mobile.buttonMarkup.hoverDelay = 0;
    
    function killStorage(){
        localStorage.setItem("clientSelected", '');
    }

    function redirectToPage(){
        if(localStorage.getItem('clientSelected')){
            var clientSelected = JSON.parse(localStorage.getItem('clientSelected'));
            if(clientSelected.products == ''){
                $.mobile.navigate("#pagina11");
                localStorage.setItem('clientSelected', '');
            }
        }    
        else{
            $.mobile.navigate("#pagina11");
        }    
    }

    function cleanClientSelected(){
        pageClientShow();
    }

    function pageClientShow() { 
        $('.products_clients_add').html('');
        var html = "";
        var products = JSON.parse(localStorage.getItem('products_inventory'));
        for(var i in products) {
            
            if(getArrayIndexProductsSelected().indexOf(products[i].id) !== -1){
                
                html += '<li class="myProductSelected">\
                    <a href="#" data-role="button" class="productSelected" data-id="'+products[i].id+'" data-selected="true">\
                        <img src="'+DOMAIN+products[i].model_image+'">\
                        <span>'+products[i].product_name+'</span>\
                    </a>\
                </li>'
            }
            else{
                
                html += '<li>\
                    <a href="#" data-role="button" class="productSelected" data-id="'+products[i].id+'" data-selected="false">\
                        <img src="'+DOMAIN+products[i].model_image+'">\
                        <span>'+products[i].product_name+'</span>\
                    </a>\
                </li>'
            }
        }
        $('.products_clients_add').append(html);
        $('.products_clients_add').trigger('create');
        var a = '<a href="#" class="overlay_product"></a>';
        $(a).insertAfter('.myProductSelected');
        $('.see_more_products_clients').text(getCurrentTotal());
    }
    
    function getClientSelected() {
    	var clientSelected = false;
        var objClient = localStorage.getItem('clientSelected');
        objClient = objClient != ''?objClient:false;
        if(objClient){
            if(typeof(JSON.parse(objClient)) == 'object'){
                clientSelected = JSON.parse(localStorage.getItem('clientSelected'));
            }        	
        }
        else{
            $.mobile.navigate("#pagina11");
            localStorage.setItem("clientSelected", '');
        }
        return clientSelected;
    }

    function getArrayIndexProductsSelected(){
    	/* return indexs of client selected */
        var arrayIndexs = [];
        var clientSelected = getClientSelected();
        for(var i in storageClients){
        	if (storageClients && storageClients[i].id == clientSelected.id) {
	            for(var j in storageClients[i].products){
	                arrayIndexs.push(storageClients[i].products[j].id);
	            }
        	}
        }
        return arrayIndexs;
    }

    function getArrayIndexClientsSelected(){
        var arrayIndexs = [];
        for(var i in storageClients){
            arrayIndexs.push(storageClients[i].id);
        }
        return arrayIndexs;
    }

    function goProduct() {
        if(localStorage.getItem('clientSelected')){
            var clientSelected = JSON.parse(localStorage.getItem('clientSelected'));
            //validar si esta repetido
            var index = getArrayIndexClientsSelected().indexOf(clientSelected.id);
            if(index !== -1){
                storageClients[index] = clientSelected;
            }

            if(localStorage.getItem('clientSelected')){
                $.mobile.navigate("#pagina13");
            }
            else{
                alert('Chooce Someone!');
            }
        }
        else{
            console.log('goProduct');
        }

    }

    function selectProduct(e) {
        e.preventDefault();
        var products = JSON.parse(localStorage.getItem('products_inventory')),
            clientSelected = JSON.parse(localStorage.getItem('clientSelected')),
            productSelected,
            id = $(this).data('id');
        var li = $(this).parent('li');
        for(var i in products){
            if(!$(this).data('selected')){
                //Add Products to LocalStorage
                if(products[i].id === id){
                    productSelected = {
                        'id': products[i].id,
                        'product_name': products[i].product_name,
                        'model_name': products[i].model_name,
                        'quantity': products[i].quantity,
                        'price': calculatePrice(products[i]),
                        'model_image': products[i].model_image,
                        'discount': getDiscount(products[i])
                    };
                    clientSelected.products.push(productSelected);
                    localStorage.setItem("clientSelected", JSON.stringify(clientSelected));
                    $(this).data('selected', true);
                    $(li).addClass("myProductSelected");   
                    $('.see_more_products_clients').text(getCurrentTotal());
                    break;
                }
            //Remove Products to LocalStorage
            } else {
                var remove = -1;
                $.each(clientSelected.products, function(x, value){
                    if(value.id == id){                                                
                        remove = x;
                    }
                });
                if(remove > -1) {
                    clientSelected.products.splice(remove, 1);
                    localStorage.setItem("clientSelected", JSON.stringify(clientSelected));
                    $(this).data('selected',false);
                    $(li).removeClass("myProductSelected");
                    $('.see_more_products_clients').text(getCurrentTotal());                    
                    break;
                }
            }
        }
    
    }

    function getCurrentTotal(){
        var totalPrice = 0;
        if(localStorage.getItem('clientSelected')){
            var products = JSON.parse(localStorage.getItem('clientSelected')).products;
            for(var i in products){
                totalPrice += parseFloat(products[i].price); 
            }
        }
        return totalPrice;
    }

    /* Client */

    function saveClientStorage(){
        if(localStorage.getItem('clientSelected')){            
            var clientSelected = JSON.parse(localStorage.getItem('clientSelected'));        
            if(clientSelected.products == ''){
                cleanClientSelected();
                $.mobile.navigate("#pagina11");
            }
            else if(clientSelected.products != ''){                
                //validar si esta repetido
                var index = getArrayIndexClientsSelected().indexOf(clientSelected.id);
                if(index !== -1){                    
                    storageClients[index] = clientSelected;
                }
                else{                    
                    storageClients.push(clientSelected);
                }
                $.mobile.navigate("#pagina12");
            }
        }
    }

    function calculatePrice(product) {
    	var clientSelected = JSON.parse(localStorage.getItem('clientSelected'));
        //business client -> wholesale 1
        //consumer -> retail 2
        var price =0;
        if(clientSelected.type === 1) {            
            price = product.wholesale_price;
        }
        else if(clientSelected.type === 2) {        
            price = product.retail_price;
            if (typeof(product.clients_discount) != 'undefined') {                
	            if (typeof(product.clients_discount[clientSelected.id]) != 'undefined') {
	        		price = product.clients_discount[clientSelected.id].amount;
	        	}
            }
        }        
        return price;
    }
    
    function getDiscount(product) {
    	var discount = 0;
    	var clientSelected = JSON.parse(localStorage.getItem('clientSelected'));
    	if(clientSelected.type === 2) {
            if (typeof(product.clients_discount[clientSelected.id]) != 'undefined') {
            	discount = product.clients_discount[clientSelected.id].id;
        	}
        }
    	return discount;
    }
    
    function getClientById(id) {
        
    	/* from local storage */
    	for (var index in storageClients) {
    		var client = storageClients[index];
    		if (client.id == id) {
    			return client;
    		}
    	}
    	return false;
    }

    function listClients() {
        var url = urls.clients_list;
        var clients_name_id = [];
        $.ajax({
           url: url,
           type: 'POST',
           data: {
                rp_token: token
           },
           dataType: 'json',
           beforeSend: beforeAjaxLoader(),
           success: function(data){
                $('#pagina11').find('#list_clients').html('');
                var ul_for_list_clients = $('#pagina11').find('#list_clients'),
                    html_to_insert = '';
                    items_list = data.items_list;
                
                for(var client in items_list){
                   html_to_insert += '<input type="radio" name="radio-choice-1" id="radio-choice-'+items_list[client].id+'" data-id="'+items_list[client].id+'"value="choice-'+items_list[client].id+'"/>\
                                    <label\
                                        for="radio-choice-'+items_list[client].id+'"\
                                        data-corners="false" class="labelRadioButton"\
                                        >\
                                        <img src="'+DOMAIN+items_list[client].image+'" class="image_client"/>'+items_list[client].name+'\
                                    </label>';
                };
                
                ul_for_list_clients.append(html_to_insert);
                $('#list_clients').trigger('create');
                $(":radio").unbind("change");
                $(":radio").bind("change", function(){
                    if(localStorage.getItem('clientSelected')){                        
                        var clientSelected = JSON.parse(localStorage.getItem('clientSelected'));
                        //validar si esta repetido
                        var index = getArrayIndexClientsSelected().indexOf(clientSelected.id);
                        if(index !== -1){
                            
                            storageClients[index] = clientSelected;
                        }
                    }
                    var self = $(this);
                    for(var client in items_list){
                        if(items_list[client].id === self.data('id')){
                            if(storageClients != ''){
                                
                                var result = false;                                     
                                /* get client from storage */
                                var client_exists = getClientById(items_list[client].id);
                                if (client_exists) {
                                    
                                    localStorage.setItem("clientSelected", JSON.stringify(client_exists));
                                    clientSelected = JSON.parse(localStorage.getItem('clientSelected'));
                                    $.mobile.navigate("#pagina12");
                                    result = true;
                                } else {
                                    result = false;
                                }  
                                if(result == false) {
                                    var clientSelected = createNewClient(items_list[client])
                                }
                            } else {
                                var clientSelected = createNewClient(items_list[client]);
                            }
                        }
                    }
                    //pintar select con las lista de clientes de la pagina 12
                    $('#selectClient').html('');
                    var html ='';
                    for(var i in items_list){
                        html +='<option value="'+items_list[i].id+'">'+items_list[i].name+'</option>';
                    }
                    $('#selectClient').append(html);
                    $('#selectClient-button > span > span > span').text(clientSelected.name);
                    localStorage.setItem("clientSelected", JSON.stringify(clientSelected));
                    if(clientSelected.products == ''){
                        $.mobile.navigate("#pagina13");
                    }
                });
                //localStorage.setItem("allClients", JSON.stringify(items_list));            
            },
            complete: completeAjaxLoader()
        });
    }

    function createNewClient(client) {        
        var clientSelected = {
            'id': client.id,
            'name': client.name,
            'image': client.image,
            'type': client.type,
            'products':[],
            'total':0
        };
        localStorage.setItem("clientSelected", JSON.stringify(clientSelected));
        return clientSelected;
    }

    /* Authenticate */

    function loginAuth(event) {
        event.preventDefault();
        var result = checkConnection(Connection.ETHERNET);
        if(result ==  true){
            var url = urls.login;
            console.log(url);
            console.log('test');
            $.ajax({
                url: url,
                data: {
                    password: $('#password').val(),
                    email: $('#username').val()
                },
                type: 'POST',
                dataType: 'json',
                beforeSend: function(){
                    $.mobile.loading("show", {
                        textVisible: true,
                        theme: 'c',
                        textonly: false
                    });
                },
                success: function (data) {
                    if (data.status === 'OK') {
                        window.localStorage.setItem("rp-token", data.token);
                        token = data.token;
                        eventsAfterLogin();
                    } else {
                        $('.overlay').fadeIn().children().addClass('effect_in_out');
                    }
                },
                complete: function(){
                    $.mobile.loading("hide");
                }
            });
        } else {
            alert('Check your internet connection')
        }
    }

    function logOut(event) {
        event.preventDefault();
        window.localStorage.removeItem('products_inventory');                
        window.localStorage.removeItem("rp-token");
        window.localStorage.removeItem("clientSelected");
        $('#container-login').css('display','inline');
        $.mobile.navigate("#pagina1");
    }

    function authToken() {
        //Cuando regresa del search falla
        var result = checkConnection();
        //var result =  true;
        debugger;
        if(result ==  true){
            var url = urls.loginToken;
            $.ajax({
                url: url,
                data: {
                    token: token
                },
                type: 'POST',
                dataType: 'json',
                beforeSend: beforeAjaxLoader(),
                success: function (data) {
                    if (data.status === 'OK') {
                        window.localStorage.setItem("rp-token", data.token);
                        token = data.token;
                        eventsAfterLogin();
                    }
                    else {
                        $('#container-login').css('display','inline');
                        $('.overlay').fadeIn().children().addClass('effect_in_out');
                    }
                },
                complete: completeAjaxLoader()
            });
        }
        if (Offline.state == 'down') {
            if(window.localStorage.getItem("rp-token") != null &&
                window.localStorage.getItem("rp-token") != undefined){
                token = window.localStorage.getItem("rp-token");
                debugger;
                eventsAfterLogin();
            } else {
                alert('Check your internet connection')
            }
        }
    }

    function eventsAfterLogin() {
        categoryFactory.set_token(token);
        buyerInventoryFactory.set_token(token);
        countryFactory.set_token(token);
        stateFactory.set_token(token);
        cityFactory.set_token(token);
        clientFactory.set_token(token);
        //client.getDataAddressClient();
        getInventoryItems();
        getAnalyzerInformation();

        $('#container-login').css('display','none');
        $.mobile.navigate("#pagina2");
    }

    /* Buyer Inventory */

    function getInventoryItems() {
        buyerInventoryFactory.get_all(showInventory, false);
    }

    function showInventory(list){
        if(list != undefined){
            var items_list = list;
            var ul_for_inserting = $('#pagina2').find('.tab1').find('ul'),
                        html_to_insert = '';

            $.each(items_list, function(i, model) {
                html_to_insert += '<li>\
                                     <a href="#pagina5"\
                                         class="model-data"\
                                         data-model-name="'+model.model_name+'"\
                                         data-product-name="'+model.product_name+'"\
                                         data-retail-price="'+model.retail_price+'"\
                                         data-quantity="'+model.quantity+'"\
                                         >\
                                         <img src="'+DOMAIN+model.model_image+'"/>\
                                     </a>\
                                 </li>';
            });
            ul_for_inserting.html('');
            ul_for_inserting.append(html_to_insert);
            localStorage.setItem('products_inventory', JSON.stringify(items_list));
            $('.model-data').live('click', showDetail);
        }
    }

    /* Analyzer */

    function getAnalyzerInformation() {
    	if (Offline.state == 'down') {
    		return false;
    	}
        var url = urls.analyzer;
        $.ajax({
           url: url,
           type: 'POST',
           data: {
                rp_token: token
           },
           dataType: 'json',
           beforeSend: beforeAjaxLoader(),
           success: function(data){
               analyzer_information = data.context['information'];
               analyzer_information_time = new Date();
               processAnalyzerInformation(1);
           },
           complete: function(){
            $.mobile.loading("hide");
           }
        });
    }

    function processAnalyzerInformation(type) {
        // dates limit
        var initial_date = new Date();
        var finish_date = new Date();

        /* control: 1=month, 2=week, 3=day */
        if (typeof(type) == 'undefined') {
            type = 1;
        }

        if (type == 1) { /* month */
            var date = new Date();
            var initial_date = new Date(date.getFullYear(), date.getMonth(), 1);
            var finish_date = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        } else if (type == 2) { /* week */
            var date = new Date();
            var day = date.getDay(),
                diff = date.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
            var initial_date = new Date(date.setDate(diff));
            var finish_date = initial_date + 6;

        } else if (type == 3) { /* day */
            var initial_date = new Date();
            var finish_date = new Date();
        }
        /* TOTALS */
        var total_sales = 0;
        var total_units = 0;
        var total_profit = 0;

        for(var i in analyzer_information['values']) {
            item = analyzer_information['values'][i];
            date = get_date_from_string(item['date']);
            if (date >= initial_date && date <= finish_date) {
                total_sales += item['sale_value'];
                total_units += item['sale_volume'];
                total_profit += item['projected_profit'];
            }
        }
        $('#pagina2').find('.tab2').find('#analyzer_total_sales').html(total_sales);
        $('#pagina2').find('.tab2').find('#analyzer_total_units').html(total_units);
        $('#pagina2').find('.tab2').find('#analyzer_total_profit').html(total_profit);

        /* POPULAR */
        var total_models_data = total_models(initial_date, finish_date, analyzer_information['variants']['data']);
        var popular = false;
        for (var i in total_models_data) {
            item = total_models_data[i];
            if (popular) {
                if (popular['quantity'] < item['quantity']) {
                    popular = item;
                }
            } else {
                popular = item;
            }
        }
        if (popular !== false) {
            if (typeof(analyzer_information['variants']['models'][popular['product_model_id']]) != 'undefined') {
                details = analyzer_information['variants']['models'][popular['product_model_id']];
                $('#pagina2').find('.tab2').find('#most_popular_img').html('<img src="'+DOMAIN+details['image']+'" />');
                $('#pagina2').find('.tab2').find('#most_popular_name').html(details['name']);
                $('#pagina2').find('.tab2').find('#most_popular_sold').html(popular['quantity']);
            }
        }

        /* graphic */
        var date_formated = analyzer_information_time.toLocaleDateString() + ' ' + analyzer_information_time.toLocaleTimeString();
        result = [{
            Name:"Resume (" + date_formated + ")", Sale:total_sales, Profit:total_profit
        }];

        $('#graphic').html('');
        start_graphic(result);
        $('#graphic').trigger('create');

        return true;
    }

    function total_models(initial_date, finish_date, data) {
        result = {};
        for (var i in data) {
            item = data[i];
            date = get_date_from_string(item['date']);
            if (date >= initial_date && date <= finish_date) {
                if (typeof(result[item['product_model_id']]) == 'undefined') {
                    result[item['product_model_id']] = item;
                } else {
                    result[item['product_model_id']]['quantity'] += item['quantity'];
                }
            }
        }
        return result;
    }

    function get_date_from_string(string_date) {
        parts = string_date.split('-');
        var year = parts[0], month = parts[1], day = parts[2];
        if (month.substring(0, 1) == '0') {
            month = month.substring(1);
        }
        if (day.substring(0, 1) == '0') {
            day = day.substring(1);
        }
        month = parseInt(month) - 1;
        return new Date(parseInt(year), parseInt(month), parseInt(day));
    }

    function start_graphic(data_graphic) {
        var div = $('<div></div>');
        	div.attr('id', 'graphic_jqplot');
          	$('#content_init_graphic').append(div);
        create_graphic(data_graphic);
    }

    function create_graphic(data) {
        var s1 = [];
        var s2 = [];
	    var ticks = [];
        for(index in data) {
        var item = data[index];
        	s1[s1.length] = item.Profit;
        	s2[s2.length] = item.Sale;
        	ticks[ticks.length] = item.Name;
        }
	    plot2 = $.jqplot('graphic_jqplot', [s1, s2], {
	        seriesDefaults: {
	            renderer:$.jqplot.BarRenderer,
	            pointLabels: { show: true },
	            rendererOptions: {fillToZero: true}
	        },
	        axes: {
	            xaxis: {
	                renderer: $.jqplot.CategoryAxisRenderer,
	                ticks: ticks
	            }
	        },
	        series:[
	                {label:'Profit'},
	                {label:'Sale'},
	            ],
            legend: {
                show: true,
                placement: 'outsideGrid' /* insideGrid */
            }
	    });
	    $('#chart2').bind('jqplotDataHighlight',
	        function (ev, seriesIndex, pointIndex, data) {}
	    );
	    $('#chart2').bind('jqplotDataUnhighlight',
	        function (ev) {}
	    );
	    /* transfer graphic to view analizer */
	    $('#graphic').append($('#graphic_jqplot'));
    }

    /* Invoice */

    function showInvoice() {
        if(localStorage.getItem('clientSelected')){
            $('#selectClient').html('');
            var clientSelected = JSON.parse(localStorage.getItem('clientSelected'));
            var clients = JSON.parse(localStorage.getItem('clients'));
            var html ='';
            var html = '<option value="'+clientSelected.id+' data-id="'+clientSelected.id+'">'+clientSelected.name+'</option>';   
            for(var i in clients){
                if(clients[i].id !== clientSelected.id){
                    html +='<option value="'+clients[i].id+'" data-id="'+clientSelected.id+'">'+clients[i].name+'</option>';   
                }
            }
            $('#selectClient').append(html);

            $('#selectClient-button > span > span > span').text(clientSelected.name);        
            $.mobile.navigate("#pagina12");
        }
        else{
            alert('Chooce Someone!');
        }        
    }

    function updateAfterCreateInvoice(clientSelected) {
    	for(var i in storageClients){
            var index = getArrayIndexClientsSelected().indexOf(clientSelected.id);
            if(index !== -1){
                var remove = -1;
                $.each(storageClients, function(i, value){
                    if(value.id == clientSelected.id){
                        remove = i;
                    }
                });
                if(remove > -1) {
                	invoice.success_create(clientSelected.products);
                    storageClients.splice(remove, 1);
                    clientSelected.products = [];
                    localStorage.setItem("clientSelected", JSON.stringify(clientSelected));
                }
                $.mobile.navigate("#pagina11");
            }
        }
    }

    function sendProductsInvoice(event) {
        event.preventDefault();
        var clientSelected = JSON.parse(localStorage.getItem('clientSelected'));
        var data_client = [];
        var url = urls.send_invoice;
        for (var index in storageClients) {
    		if (storageClients[index].id == clientSelected.id) {
    			data_client[0] = storageClients[index];
	        	break;
	        }
        }
        var data = {
            rp_token: token,
            client: JSON.stringify(data_client)
        };

		if (!invoice.are_valid_products(data_client[0].products)) {
        	alert(invoice.get_message());
        	return false;
        }

        $.ajax({
          url: url,
          type: 'POST',
          dataType: 'json',
          data: data,
          beforeSend: function(){
                $.mobile.loading("show", {
                    textVisible: true,
                    theme: 'c',
                    textonly: false
                });
            },
            success: function(data) {
                if (data.status == true) {
                	updateAfterCreateInvoice(clientSelected);
                } else {
                    alert('an error occurred');
                    $.mobile.navigate("#pagina11");
                }
            },
            complete: function(){
                $.mobile.loading("hide");
            }
        });
        if (Offline.state == 'down') {
        	updateAfterCreateInvoice(clientSelected);
        	$.mobile.navigate("#pagina11");
        }
    }

    function moveToOtherClient(){
        var indice = $(this).index();
        var idClientDestination = $('#selectClient > option').eq(indice).val();
        var bandera = false;

        if(localStorage.getItem('clientSelected')){
            //traigo los productos y id de clientSelected
            var productsClientSelected = JSON.parse(localStorage.getItem('clientSelected')).products;
            var idClientSelected = JSON.parse(localStorage.getItem('clientSelected')).id;

            if(storageClients){
                for(var i in storageClients){
                    //si ya tiene productos
                    if(storageClients[i].id  == idClientDestination){
                        //traer los productos a agregar
                        var array = [];
                        for(var k in storageClients[i].products){
                            array.push(storageClients[i].products[k].id);
                        }
                        //este contendra los nuevos
                        var productsToMigrate = [];
                        for(var j in productsClientSelected){
                            if(array.indexOf(productsClientSelected[j].id) == -1){
                                productsToMigrate.push(productsClientSelected[j].id);
                            }
                        }
                        //cambiar sus detalles
                        var products = JSON.parse(localStorage.getItem('products_inventory'));
                        for(var j in products){

                            if(productsToMigrate.indexOf(products[j].id) !== -1){
                                productSelected = {
                                    'id': products[j].id,
                                    'product_name': products[j].product_name,
                                    'model_name': products[j].model_name,
                                    'quantity': products[j].quantity,
                                    'price': calculatePrice(products[j]),
                                    'model_image': products[j].model_image,
                                    'discount': getDiscount(products[j])
                                };
                                //agregar al nuevo
                                storageClients[i].products.push(productSelected);
                            }
                        }
                        localStorage.setItem("clientSelected", JSON.stringify(storageClients[i]));
                        saveClientStorage();
                        bandera = false;
                    }
                    else{
                        bandera = true;
                    }
                }
                //si no existe, es decir no tiene productos, solo capturo sus features(type, name, id) y lo almaceno en clientSelected
                //para luego en storageClients
                if(bandera){
                    for(var i in items_list){
                        if(items_list[i].id == idClientDestination){
                            var clientSelected = {
                                'id': items_list[i].id,
                                'name': items_list[i].name,
                                'image': items_list[i].image,
                                'type': items_list[i].type,
                                'products':[],
                                'total':0
                            };
                            var products = JSON.parse(localStorage.getItem('products_inventory'));
                            for(var j in products){

                                if(getArrayIndexProductsSelected().indexOf(products[j].id) !== -1){
                                    productSelected = {
                                        'id': products[j].id,
                                        'product_name': products[j].product_name,
                                        'model_name': products[j].model_name,
                                        'quantity': products[j].quantity,
                                        'price': calculatePrice(products[j]),
                                        'model_image': products[j].model_image,
                                        'discount': getDiscount(products[j])
                                    };

                                    clientSelected.products.push(productSelected);
                                }
                            }
                            localStorage.setItem("clientSelected", JSON.stringify(clientSelected));

                            //cambiar precios segun tipo cliente
                            saveClientStorage();
                        }
                    }
                }
                for(var i in storageClients){
                    if(storageClients[i].id == idClientSelected){

                        storageClients.splice(i,1);
                    }
                }
            }
        }
    }

    function changeTab() {
        var newSelection = $(this).find('a').data('tab-class');
        var prevSelection = 'tab1';
        if(newSelection == 'tab1'){
            prevSelection = 'tab2';
        } else {
        	getAnalyzerInformation();
        }
        $("."+prevSelection).addClass("ui-screen-hidden");
        $("."+newSelection).removeClass("ui-screen-hidden");
        prevSelection = newSelection;
    }
        function killStorage(){
        localStorage.setItem("clientSelected", '');
    }
    function redirectToPage(){
        if(localStorage.getItem('clientSelected')){
            var clientSelected = JSON.parse(localStorage.getItem('clientSelected'));
            if(clientSelected.products == ''){
                $.mobile.navigate("#pagina11");
                localStorage.setItem('clientSelected', '');
            }
        }    
        else{
            $.mobile.navigate("#pagina11");
            console.log('redirectToPage');
        }    
    }

    function cleanClientSelected(){        
        pageClientShow();
    }
    function pageClientShow() { 
        $('.products_clients_add').html('');
        var html = "";
        var products = JSON.parse(localStorage.getItem('products_inventory'));
        for(var i in products) {
            
            if(getArrayIndexProductsSelected().indexOf(products[i].id) !== -1){
                
                html += '<li class="myProductSelected">\
                    <a href="#" data-role="button" class="productSelected" data-id="'+products[i].id+'" data-selected="true">\
                        <img src="'+DOMAIN+products[i].model_image+'">\
                        <span>'+products[i].product_name+'</span>\
                    </a>\
                </li>'
            }
            else{
                
                html += '<li>\
                    <a href="#" data-role="button" class="productSelected" data-id="'+products[i].id+'" data-selected="false">\
                        <img src="'+DOMAIN+products[i].model_image+'">\
                        <span>'+products[i].product_name+'</span>\
                    </a>\
                </li>'
            }
        }
        $('.products_clients_add').append(html);
        $('.products_clients_add').trigger('create');
        var a = '<a href="#" class="overlay_product"></a>';
        $(a).insertAfter('.myProductSelected');
        $('.see_more_products_clients').text(getCurrentTotal());
    }
    
    function getClientSelected() {
        var clientSelected = false;
        var objClient = localStorage.getItem('clientSelected');
        objClient = objClient != ''?objClient:false;
        if(objClient){
            if(typeof(JSON.parse(objClient)) == 'object'){
                clientSelected = JSON.parse(localStorage.getItem('clientSelected'));
            }           
        }
        else{
            $.mobile.navigate("#pagina11");
            localStorage.setItem("clientSelected", '');
        }
        return clientSelected;
    }

    function getArrayIndexProductsSelected(){
        /* return indexs of client selected */
        var arrayIndexs = [];
        var clientSelected = getClientSelected();
        for(var i in storageClients){
            if (storageClients && storageClients[i].id == clientSelected.id) {
                for(var j in storageClients[i].products){
                    arrayIndexs.push(storageClients[i].products[j].id);
                }
            }
        }
        return arrayIndexs;
    }
    function getArrayIndexClientsSelected(){
        var arrayIndexs = [];
        for(var i in storageClients){
            arrayIndexs.push(storageClients[i].id);
        }
        return arrayIndexs;
    }
    function goProduct() {
        if(localStorage.getItem('clientSelected')){
            var clientSelected = JSON.parse(localStorage.getItem('clientSelected'));
            //validar si esta repetido
            var index = getArrayIndexClientsSelected().indexOf(clientSelected.id);
            if(index !== -1){
                storageClients[index] = clientSelected;
            }

            if(localStorage.getItem('clientSelected')){
                $.mobile.navigate("#pagina13");
            }
            else{
                alert('Chooce Someone!');
            }
        }
        else{
            console.log('goProduct');
        }
    }
    function selectProduct(e) {
        e.preventDefault();
        var products = JSON.parse(localStorage.getItem('products_inventory')),
            clientSelected = JSON.parse(localStorage.getItem('clientSelected')),
            productSelected,
            id = $(this).data('id');
        var li = $(this).parent('li');
        
        for(var i in products){
            if(!$(this).data('selected')){
                //Add Products to LocalStorage
                if(products[i].id === id){
                    productSelected = {
                        'id': products[i].id,
                        'product_name': products[i].product_name,
                        'model_name': products[i].model_name,
                        'quantity': products[i].quantity,
                        'price': calculatePrice(products[i]),
                        'model_image': products[i].model_image,
                        'discount': getDiscount(products[i])
                    };
                    clientSelected.products.push(productSelected);                                                                        
                    console.log('SE SELECCIONO' + clientSelected.id);
                    localStorage.setItem("clientSelected", JSON.stringify(clientSelected));
                    $(this).data('selected', true);
                    $(li).addClass("myProductSelected");   
                    $('.see_more_products_clients').text(getCurrentTotal());
                    break;
                }
            //Remove Products to LocalStorage
            } else {
                var remove = -1;
                $.each(clientSelected.products, function(x, value){
                    if(value.id == id){                                                
                        remove = x;
                    }
                });
                if(remove > -1) {
                    clientSelected.products.splice(remove, 1);
                    console.log('1: '+JSON.stringify(clientSelected))
                    localStorage.setItem("clientSelected", JSON.stringify(clientSelected));
                    $(this).data('selected',false);
                    $(li).removeClass("myProductSelected");
                    $('.see_more_products_clients').text(getCurrentTotal());                    
                    break;
                }
            }
        }
    }
    function getCurrentTotal(){
        var totalPrice = 0;
        if(localStorage.getItem('clientSelected')){
            var products = JSON.parse(localStorage.getItem('clientSelected')).products;
            for(var i in products){
                totalPrice += parseFloat(products[i].price); 
            }
        }
        return totalPrice;
    }

    function saveClientStorage(){
        if(localStorage.getItem('clientSelected')){            
            var clientSelected = JSON.parse(localStorage.getItem('clientSelected'));        
            if(clientSelected.products == ''){
                cleanClientSelected();
                $.mobile.navigate("#pagina11");
            }
            else if(clientSelected.products != ''){                
                //validar si esta repetido
                var index = getArrayIndexClientsSelected().indexOf(clientSelected.id);
                if(index !== -1){                    
                    storageClients[index] = clientSelected;
                }
                else{                    
                    storageClients.push(clientSelected);
                }
                $.mobile.navigate("#pagina12");
            }
        }
    }

    function calculatePrice(product) {
        var clientSelected = JSON.parse(localStorage.getItem('clientSelected'));
        //business client -> wholesale 1
        //consumer -> retail 2
        var price =0;
        if(clientSelected.type === 1) {            
            price = product.wholesale_price;
        }
        else if(clientSelected.type === 2) {        
            price = product.retail_price;
            if (typeof(product.clients_discount) != 'undefined') {                
                if (typeof(product.clients_discount[clientSelected.id]) != 'undefined') {
                    price = product.clients_discount[clientSelected.id].amount;
                }
            }
        }        
        return price;
    }
    
    function getDiscount(product) {
        var discount = 0;
        var clientSelected = JSON.parse(localStorage.getItem('clientSelected'));
        if(clientSelected.type === 2) {
            if (typeof(product.clients_discount[clientSelected.id]) != 'undefined') {
                discount = product.clients_discount[clientSelected.id].id;
            }
        }
        return discount;
    }

    /* Product */

    function createProduct() {
        var newIcon = 'check';
        $(this).sibling().removeClass('ui-icon-'.newIcon);
        $(this).attr('data-icon', newIcon)
            .find('.ui-icon')
            .addClass('ui-icon-' + newIcon)
            .removeClass('ui-icon-');
    }    

    function setCategory(event) {
        $('#category-id').text($(this).data('id'));
        var text_category = $(this).children('h3').text();
        text_category = text_category.replace("click to collapse contents", "");
        $('#category-name').text(text_category);

        if($(this).data('json') != 't') {
            var collapse = $(this).children('div');
            var main_category = $(this).data('id');
            categoryFactory.get_sub_category(show_category_detail,false , main_category,collapse);
            $(this).data('json', 't');
            $(this).removeClass('option-expand');
            $(this).addClass('option-collapse');
            $(this).children('div').children('div').collapsibleset().trigger('create');
        }
    }

    function show_category_detail(category_detail, collapse){
        $.each(category_detail, function(i, value) {
            collapse.prepend('' +
                '<div data-role="collapsible" data-theme="c" class="option-expand" data-id="'+value.id+'" data-content-theme="c"> ' +
                '<h3>'+value.name+'</h3>' +
                '<div data-role="collapsible-set" >' +
                '</div> </div>');
        });
        collapse.collapsibleset().trigger('create');
    }

    function saveProduct() {
        var nameProduct = $('#browser').val(),
            nameVariant = $('#name-variant').val(),
            categoryId = $('#category-id').text(),
            quantity = $('#quantity').val(),
            sku = $('#sku').val(),
            costPrice = $('#cost-price').val(),
            wholeSalePrice = $('#wholesale-price').val(),
            retailPrice = $('#retail-price').val();
        if(nameProduct != '' && categoryId!='' && costPrice!=''){
            var url = urls.saveProduct;
            $.ajax({
                url: url,
                type: 'POST',
                data: {
                    name_product: nameProduct,
                    name_variant: nameVariant,
                    category_id: categoryId,
                    quantity : quantity,
                    sku: sku,
                    cost_price: costPrice,
                    whole_sale_price: wholeSalePrice,
                    retail_price: retailPrice,
                    rp_token: token
                },
                dataType: 'json',
                beforeSend: beforeAjaxLoader(),
                success: function(data){
                    if(data.status.status == true){
                        uploadPhoto(data.id);
                    } else {
                        alert('an error occurred');
                    }

                },
                complete: completeAjaxLoader()
            });
        } else {
            alert('Data Incomplete');
        }
    }

    function getInformationProduct() {
        categoryFactory.get_main_category(showInformation, false);
    }

    function showInformation(products, categories){
        /*
        Event before press Create Products
         */
        showProductRelated(products);
        showMainCategories(categories);
    }
    function showProductRelated(products){
        /*
        Show products related in input name product
         */
        $.each(products, function(i, value) {
            $('#browsers').append('<option data-id="'+value.id+'" value="'+value.name+'">')
        });
    }

    function showMainCategories(categories){
        /*
        Show main categories in create product
         */
        $.each(categories, function(i, value) {
            $('#categories-list').append('' +
                '<div data-role="collapsible" class="option-expand" data-theme="c" data-id="'+value.id+'" data-content-theme="c">' +
                '<h3>'+value.name+'</h3>' +
                '</div>');
            });
    }

    function getCompleteInformation(event) {
        var productName = $(this).val();
        var productId = 0;
        $.each($('#browsers option'), function(i, value){
            if(value.value == productName){
                productId = $(value).data('id');
            }
        });
        var information = localStorage.getItem('productRelated');
        information = JSON.parse(information);

        $.each(information.products, function(i, value) {
            if(productId == value.id){
                $('#category-name').text(value.category_name);
                $('#category-id').text(value.id);
                $('#sku').text(value.sku);
            }
        });
    }

    function showDetail() {
        var content = $('#pagina5').find('.inventory_detail_product'),
            $this = $(this),
            modelName = $this.data('modelName'),
            productName = $this.data('productName'),
            quantity = $this.data('quantity'),
            retailPrice = $this.data('retailPrice'),
            image = $this.find('img').attr('src'),
            html_to_insert = '<ul>\
                                  <li>\
                                      <img src="'+image+'"/>\
                                  </li>\
                                  <li class="inventory_detail_product_features">\
                                     <ul>\
                                         <li><b>Product: </b>'+productName+'</li>\
                                         <li><b>Variant: </b>'+modelName+'</li>\
                                         <li><b>Quantity: </b>'+quantity+' </li>\
                                      </ul>\
                                  </li>\
                              </ul>\
                              <h2><b>Retail Price: </b><br><span class="price">$ '+retailPrice+'</span></h2>';
        content.empty();
        content.append(html_to_insert);
    }

    /* Search */

    function changeSearch() {
        window.location.replace("search.html");
    }

    function pageMyProductsShow(){
        saveClientStorage();
        $('#theDate').val(getDateMonthYear());
        var myProducts = JSON.parse(localStorage.getItem('clientSelected')).products,
            ul_for_my_products = $('#myProducts');
        ul_for_my_products.html('');
        var html = '';

        for(var i in myProducts){
            html += '<li class="without_radious" data-id="'+myProducts[i].id+'">\
                        <a href="">\
                            <img src="'+DOMAIN+myProducts[i].model_image+'" class="ui-li-icon">\
                            <span class="ui-li-aside">'+myProducts[i].product_name+'</span>\
                            <input type="number" class="qtyInvoice" min="1" value="'+myProducts[i].quantity+'">\
                            <span class="ui-li-aside">'+myProducts[i].price+'</span>\
                            <span class="ui-li-aside totalprice">'+(myProducts[i].price*myProducts[i].quantity)+'</span>\
                            <span class="removeProduct">X</span>\
                        </a>\
                    </li>';
        }
        ul_for_my_products.append(html);
        ul_for_my_products.trigger('create');

    }

    function removeMyProduct() {
        var clientSelected = JSON.parse(localStorage.getItem('clientSelected')),
        currentPrice = parseInt($('.see_more_products_clients').text()),
        id = $(this).parents('li').data('id');
        var remove = -1
        $.each(clientSelected.products, function(i, value){
            if(value.id == id){
                remove = i
            }
        });
        if(remove > -1) {
            clientSelected.products.splice(remove, 1);
            localStorage.setItem("clientSelected", JSON.stringify(clientSelected));
        }

        //save in storage

        for(var i in storageClients){
            var index = getArrayIndexClientsSelected().indexOf(clientSelected.id);
            if(index !== -1){
                $.each(storageClients, function(i, value){
                    if(value.id == clientSelected.id){
                        value.products = clientSelected.products;
                    }
                });
            }
        }
        pageMyProductsShow();
    }

    function updateMyProduct() {
        var clientSelected = JSON.parse(localStorage.getItem('clientSelected'));
        var myProducts = clientSelected.products,
            idProduct = $(this).parents('.without_radious').data('id'),
            quantity = $(this).val(),
            self = $(this);

        if (isNaN(parseInt(quantity))) {
        	quantity = 0;
        } else {
        	quantity = parseInt(quantity);
        }
        
        $.each(myProducts, function(i, value){
             if(value.id == idProduct) {
                if(quantity > 1){
                    value.quantity = quantity;
                    value.totalprice = value.price * quantity;
                    self.parent().siblings('.totalprice').text(value.totalprice);
                }
                else{
                    self.val('0');
                }
             }
        });

        localStorage.setItem("clientSelected", JSON.stringify(clientSelected));

        //save in storage

        for(var i in storageClients){
            var index = getArrayIndexClientsSelected().indexOf(clientSelected.id);
            if(index !== -1){
                $.each(storageClients, function(i, value){
                    if(value.id == clientSelected.id){
                        value.products = clientSelected.products;
                    }
                });
            }
        }
    }

    function getDateMonthYear(){
        var date = new Date();
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        if (month < 10) month = "0" + month;
        if (day < 10) day = "0" + day;
        var today = year + "-" + month + "-" + day;
        return today;
    }

    function showOverlay() {
        $('.username').focus();
        $(this).fadeOut().children().removeClass('effect_in_out');
    }    
    
    function checkConnection() {
        try {
        var networkState = navigator.network.connection.type;

        if(networkState == Connection.NONE){
            return false;
        }
        return true;
        }
        catch(err) {
            return true;
        }
    }

    /* PHOTO */

    function takePicture(event) {
        event.preventDefault();
        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI
        });
    }

    function onSuccess(imageURI) {
        var image = document.getElementById('image-camera');
        imageURL = imageURI;
        image.src = imageURI;
    }

    function onFail(message) {
        //alert('Failed because: ' + message);
    }

    function uploadPhoto(id) {
        if(imageURL != undefined) {
            var options = new FileUploadOptions();
            options.fileKey="file";
            options.fileName=imageURL.substr(imageURL.lastIndexOf('/')+1);
            options.mimeType="image/jpeg";
            options.chunkedMode = false;

            var params = new Object();
            params.rp_token = token;
            params.id_product_model = id;

            options.params = params;

            var ft = new FileTransfer();
            ft.upload(imageURL, encodeURI(urls.upload), win, fail, options);
        }
    }

    function win(r) {
        eventsAfterLogin();
        imageURL = undefined;
    }

    function fail(error) {
        eventsAfterLogin();
        alert("An error has occurred image not upload");
        imageURL = undefined;
    }
}

// storageClients = [
        //     {
        //         'id':'id',
        //         'name':'name',
        //         'image':'image',
        //         'type':'type',
        //         'products':[
        //             {'name':'manzana','precio':89, 'cantidad':45, 'image':'aa.png', 'discount': 1},
        //             {'name':'manzana','precio':89, 'cantidad':45, 'image':'aa.png', 'discount': 2},
        //             {'name':'manzana','precio':89, 'cantidad':45, 'image':'aa.png', 'discount': 3},
        //             {'name':'manzana','precio':89, 'cantidad':45, 'image':'aa.png', 'discount': 4}
        //         ],
        //         'total':454  
        //     }
        // ]
Offline.options = {
       // Should we check the connection status immediatly on page load.
      checkOnLoad: true,

      // Should we monitor AJAX requests to help decide if we have a connection.
      interceptRequests: true,

      // Should we automatically retest periodically when the connection is down (set to false to disable).
      reconnect: {
        // How many seconds should we wait before rechecking.
        initialDelay: 0

        // How long should we wait between retries.
        //delay: (1.5 * last delay, capped at 1 hour)
      },

      // Should we store and attempt to remake requests which fail while the connection is down.
      requests: true,

      // Should we show a snake game while the connection is down to keep the user entertained?
      // It's not included in the normal build, you should bring in js/snake.js in addition to
      // offline.min.js.
      game: false
    }


