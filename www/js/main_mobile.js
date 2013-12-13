$(window).load(function() {
    var run = function(){
        if (Offline.state === 'up') {
            window.localStorage.setItem("rp-cache", false);
            Offline.check();
        } else {
            window.localStorage.setItem("rp-cache", true);
        }
    };
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
    //cuando es offline hacer lo siguiente
    // setInterval(function(){
    //     if(Offline.state == 'down') {
    //         $('#search-redirect').show();
    //     }
    //     if(Offline.state == 'up'){
    //         $('#search-redirect').hide();
    //     }
    // }, 1000);
    
    var imageURL = undefined,
        cache=false,
        token = window.localStorage.getItem("rp-token");

    //Events

        //Login
        $("#log_in").live("click", loginAuth);
        $('#logout').live('click', logOut);

        //Generic
        $(".navbar ul li").live("click", changeTab);
        //$('.carousel').carousel({interval: 2000});

        //Create product
        $('.categories_create_product').find('a').live('click', createProduct);
        $('#create-product').live("click", getInformationProduct);
        $('#create_item').live("click", saveProduct);
        $('.option-expand').live('expand', setCategory);
        $('#edit-image').live('click', takePicture);

        //Analyzer
        $("#browser").live('input', getCompleteInformation);
        $('.overlay,.close_modal').live('click', showOverlay);
        $('#graphic_month').live('click',function(){processAnalyzerInformation(1);});
        $('#graphic_week').live('click',function(){processAnalyzerInformation(2);});
        $('#graphic_day').live('click',function(){processAnalyzerInformation(3);});
        $('.card').live('click',function(){$(this).addClass('moved');});

        //Invoice
        $('.offline').live('click', msgOffline);
        $('#new_invoice').live('click', listClients);
        $('#goToInvoice').live('click', showInvoice);
        $('.productSelected').live('click', selectProduct);
        $('#goToProducts').live('click', goProduct);
        $( "#pagina13" ).live( "pageshow", pageClientShow);
        $('.saveClientStorage').live('click', saveClientStorage);
        $('.removeProduct').live('click', removeMyProduct);
        //$( "#pagina9" ).live( "pagebeforeshow", pageCreateClient);
        $( "#pagina12" ).live( "pageshow", pageMyProductsShow);
        $( ".qtyInvoice" ).live('keyup', updateMyProduct);
        $('#sendProductsInvoice').live('click', sendProductsInvoice);
        $('.cancel_sendProductsInvoice').live('click', goProduct);
        $('.cleanClientSelected').live('click', cleanClientSelected);
        $('#search-redirect').live('click', changeSearch);
        $('#back_page').live('click', redirectToPage);
        $('#selectClient-menu').find('li').live('click', moveToOtherClient);
        $('.kill_storage').live('click', killStorage);
        $('.returnToSelectedProducts').live('click', goProduct);

        /*Client offline*/        
        $('.disabled').parents('.ui-radio').bind('click', function(){;
            alert('Check Your Connection!');
        });
        $('#undefined-menu a').live('click', function(event){            
            event.preventDefault();
        });

    /* CLIENT */
        var countryFactory = new CountryFactory(urls, token, window.localStorage.getItem("rp-cache"));
        var stateFactory = new StateFactory(urls, token, window.localStorage.getItem("rp-cache"));
        var cityFactory = new CityFactory(urls, token, window.localStorage.getItem("rp-cache"));
        var clientFactory = new ClientFactory(urls, token, window.localStorage.getItem("rp-cache"));
        var client = new ClientModel(countryFactory, stateFactory, cityFactory, clientFactory);
        client.init(window.localStorage.getItem("rp-cache")); /* start list */

    /* PRODUCTS */
        var categoryFactory = new CategoryFactory(urls, token);
        var buyerInventoryFactory = new BuyerInventoryFactory(urls, token);
        var buyerInventory = new BuyerInventoryModel(categoryFactory, buyerInventoryFactory, clientFactory);
        buyerInventory.init();
        
    /* INVOICE */
        var invoice = new InvoiceModel();
        
    /* ANALIZER */
        var analyzer = new AnalyzerModel(buyerInventoryFactory);
        analyzer.set_domain(DOMAIN);

    //Automatic Login

    if(token != null) {
        authToken();
    } else {
        $('#container-login').css('display','inline');
    }

    try{
    	$.mobile.selectmenu.prototype.options.nativeMenu = false;
    	$.mobile.buttonMarkup.hoverDelay = 0;
    }catch(e){}

    function saveClientStorage(){
        if(localStorage.getItem('clientSelected')){            
            var clientSelected = JSON.parse(localStorage.getItem('clientSelected'));        
            if(clientSelected.products == ''){
                cleanClientSelected();
                try{$.mobile.navigate("#pagina11");}catch(e){}
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
                try{$.mobile.navigate("#pagina12");}catch(e){}
            }
        }
    }

    function calculatePrice(product) {
        var price = buyerInventory.calculate_price_by_client_selected(product);
        return price;
    }
    
    function getDiscount(product) {
    	var discount = buyerInventory.get_discount_id_by_client_selected(product);
    	return discount;
    }

    /* Authenticate */

    function loginAuth(event) {
        event.preventDefault();
        if(Offline.state == 'up') {
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
                    try{$.mobile.loading("show", {
                        textVisible: true,
                        theme: 'c',
                        textonly: false
                    });}catch(e){}
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
                    try{$.mobile.loading("hide");}catch(e){}
                }
            });
        } else {
            alert('Check your internet connection');
        }
    }

    function msgOffline(event) {
        event.preventDefault();
        alert('the action can not be processed');
    }

    function logOut(event) {
        event.preventDefault();
        window.localStorage.removeItem('buyerInventory');
        window.localStorage.removeItem('rp-token');
        window.localStorage.removeItem('items_list');
        window.localStorage.removeItem('productsSelected');
        window.localStorage.removeItem('storageClients');
        window.localStorage.removeItem('productRelated');
        window.localStorage.removeItem('categories');
        window.localStorage.removeItem("rp-token");
        window.localStorage.removeItem("clientSelected");
        $('#container-login').css('display','inline');
        $.mobile.navigate("#pagina1");
    }

    function authToken() {
        if(Offline.state == 'down') {
            if(window.localStorage.getItem("rp-token") != null &&
                window.localStorage.getItem("rp-token") != undefined){
                token = window.localStorage.getItem("rp-token");
                eventsAfterLogin();
            } else {
                alert('Check your internet connection');
            }
        } else {
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
                
                eventsAfterLogin();
            } else {
                alert('Check your internet connection');
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

        client.start_countries_values();
        getInventoryItems();
        listClients();
        client.getDataAddressClient();
        getAnalyzerInformation();
        $('#container-login').css('display','none');
        try{$.mobile.navigate("#pagina2");}catch(e){}
    }

    /* Buyer Inventory */

    function getInventoryItems() {
        var cache = false;
        if(Offline.state == 'down') {
            cache = true;
        }
        buyerInventoryFactory.get_all(showInventory, cache);
    }

    function showInventory(list) {
        if(list != undefined) {
            var items_list = list;
            var ul_for_inserting = $('#pagina2').find('.tab1').find('ul'),
                        html_to_insert = '';
            $.each(items_list, function(i, model) {
                var _offline='';
                if(model.offline == true){
                    var _offline='offline';
                }

                if (Offline.state == 'down') {
                        html_to_insert += '<li class="'+_offline+'">\
                                     <a href="#pagina5"\
                                         class="model-data"\
                                         data-model-name="'+model.model_name+'"\
                                         data-product-name="'+model.product_name+'"\
                                         data-retail-price="'+model.retail_price+'"\
                                         data-quantity="'+model.quantity+'"\
                                         class="'+_offline+'"\
                                         >\
                                         <img src="images/default_product.png"/>\
                                     </a>\
                                 </li>';
                } else {
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
                }
            });
            ul_for_inserting.html('');
            ul_for_inserting.append(html_to_insert);
            $('.model-data').live('click', showDetail);
        }
    }

    /* Analyzer */
    function getAnalyzerInformation(type) {
    	var analyzer_cache = false;
    	if (Offline.state == 'down') {
    		analyzer_cache = true;
    	}
    	analyzer.update(analyzer_cache, type);
    }
    
    function processAnalyzerInformation(type) {
    	analyzer.show_graphic(type);
    }

    /* Client */

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
        if(Offline.state == 'up') {
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
                                        try{$.mobile.navigate("#pagina12");}catch(e){}
                                        result = true;
                                    } else {
                                        result = false;
                                    }
                                    if(result == false) {
                                        var clientSelected = createNewClient(items_list[client]);
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
                            try{$.mobile.navigate("#pagina13");}catch(e){}
                        }
                    });
                    localStorage.setItem("allClients", JSON.stringify(items_list));
                },
                complete: completeAjaxLoader()
            });
        }
        else{
            items_list = JSON.parse(localStorage.getItem('allClients'));
                    $('#pagina11').find('#list_clients').html('');
                    var ul_for_list_clients = $('#pagina11').find('#list_clients'),
                        html_to_insert = '';

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
                                        try{$.mobile.navigate("#pagina12");}catch(e){}
                                        result = true;
                                    } else {
                                        result = false;
                                    }
                                    if(result == false) {
                                        var clientSelected = createNewClient(items_list[client]);
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
                            try{$.mobile.navigate("#pagina13");}catch(e){}
                        }
                    });
                    localStorage.setItem("allClients", JSON.stringify(items_list));
        }
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

        var today = new Date();
            // Today eg: '2013-12-15'
            today = today.getFullYear() + '-' + (parseInt(today.getMonth()) + 1) + '-' + today.getDate();

        var data = {
            rp_token: token,
            client: JSON.stringify(data_client),
            dateOfSale: today
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
                        var products = JSON.parse(localStorage.getItem('buyerInventory'));
                        for(var j in products) {

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
                            var products = JSON.parse(localStorage.getItem('buyerInventory'));
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
        	getAnalyzerInformation(1);
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
        var html = "",
            products = JSON.parse(localStorage.getItem('buyerInventory'));
        for(var i in products) {
            var _offline = "";
            if(products[i].offline != undefined){
                _offline = "offline";
            }

            if(getArrayIndexProductsSelected().indexOf(products[i].id) !== -1 || buyerInventory.is_inventory_in_current_select_variant(products[i].id)) {
                html += '<li class="myProductSelected">\
                    <a href="#" data-role="button" class="productSelected '+_offline+' " data-id="'+products[i].id+'" data-selected="true">\
                        <img src="'+DOMAIN+products[i].model_image+'">\
                        <span>'+products[i].product_name+'</span>\
                    </a>\
                </li>';
            }
            else{
                
                html += '<li>\
                    <a href="#" data-role="button" class="productSelected" data-id="'+products[i].id+'" data-selected="false">\
                        <img src="'+DOMAIN+products[i].model_image+'">\
                        <span>'+products[i].product_name+'</span>\
                    </a>\
                </li>';
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
        var products = JSON.parse(localStorage.getItem('buyerInventory')),
            clientSelected = JSON.parse(localStorage.getItem('clientSelected')),
            productSelected,
            id = $(this).data('id');
        var li = $(this).parent('li');
        
        for(var i in products){
            if(!$(this).data('selected')){
                //Add Products to LocalStorage
                if(products[i].id === id){
                	if (buyerInventory.inventory_has_variants(id)) {
                		buyerInventory.go_to_sub_variant_view(id);
                		break;
                	}
                    productSelected = {
                        'id': products[i].id,
                        'product_name': products[i].product_name,
                        'model_name': products[i].model_name,
                        'quantity': products[i].quantity,
                        'max': products[i].quantity,
                        'price': calculatePrice(products[i]),
                        'model_image': products[i].model_image,
                        'discount': getDiscount(products[i])
                    };
                    clientSelected.products.push(productSelected);
                    localStorage.setItem("clientSelected", JSON.stringify(clientSelected));
                    $(this).data('selected', true);
                    $(li).addClass("myProductSelected");

                    //animation
                    var self = $(this).parent('.myProductSelected');
                    var clone = $(this).parent('.myProductSelected').clone(), 
                    position = $(this).parent('.myProductSelected').position();
                    clone.addClass('clone');
                    
                    var bezier_params = {
                        start: { 
                          x: position.left, 
                          y: position.top-100, 
                          angle: -150
                        },  
                        end: {
                          x:110,
                          y:-400, 
                          angle: 180, 
                          length: .2
                        }
                    };      

                    clone.appendTo('.products_clients_add');

                    clone.animate({path : new $.path.bezier(bezier_params)}, 800);
                    setTimeout(function(){
                        self.siblings('.clone').remove();
                    }, 8000);
                    //end animation
                    //show prices
                    $('.see_more_products_clients').text(getCurrentTotal());
                    break;
                }
            //Remove Products to LocalStorage
            } else {
            	if (buyerInventory.inventory_has_variants(id)) {
            		buyerInventory.go_to_sub_variant_view(id);
            		break;
            	}
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
         if(Offline.state == 'down') {
            return false;
        }

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
                        // nameProduct.val('');
                        // nameVariant.val('');
                        // quantity.val('');
                        // wholeSalePrice.val('');
                        // retailPrice.val('');
                        // sku.val('');
                        // costPrice.val('');
                        buyerInventoryFactory.store_inventory(data);

                        uploadPhoto(data.id);

                    } else {
                        alert('an error occurred');
                    }
                },
                complete: completeAjaxLoader()
            });
            if(Offline.state == 'down') {
                var newInventory = {
                    model_name: nameVariant,
                    product_name: nameProduct,
                    quantity: quantity,
                    retail_price: retailPrice,
                    wholesale_price: retailPrice,
                    offline: true
                };
                buyerInventoryFactory.store_inventory(newInventory);
                win();
            }
        } else {
            alert('Data Incomplete');
        }

    }

    function getInformationProduct() {
        var cache = false;
        if(Offline.state == 'down') {
            cache = true;
        }
        categoryFactory.get_main_category(showInformation, cache);
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
            $('#browsers').append('<option data-id="'+value.id+'" value="'+value.name+'">');
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
            $('#categories-list').trigger('create');

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
                            <input type="text" class="qtyInvoice" value="'+myProducts[i].quantity+'" max="'+myProducts[i].max+'">\
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
        var remove = -1;
        $.each(clientSelected.products, function(i, value){
            if(value.id == id){
                remove = i;
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
        	quantity = 1;
        } else {
        	quantity = parseInt(quantity);
        }
        
        $.each(myProducts, function(i, value){
             if(value.id == idProduct) {
                if(quantity >1){
                    value.quantity = quantity;
                    value.totalprice = value.price * quantity;
                    self.parent().siblings('.totalprice').text(value.totalprice);
                }
                else{
                    self.val('1');
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
        alert('Failed because: ' + message);
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

    function beforeAjaxLoader(){
    	try{$.mobile.loading("show", {
            textVisible: true,
            theme: 'c',
            textonly: false
        });}catch(e){}
    }

    function completeAjaxLoader(){
    	try{$.mobile.loading("hide");}catch(e){}
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
        initialDelay: 1

        // How long should we wait between retries.
        //delay: (1.5 * last delay, capped at 1 hour)
      },

      // Should we store and attempt to remake requests which fail while the connection is down.
      requests: true,

      // Should we show a snake game while the connection is down to keep the user entertained?
      // It's not included in the normal build, you should bring in js/snake.js in addition to
      // offline.min.js.
      game: false
    };
