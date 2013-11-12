$(window).load(function() {
    init();
});

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
    'upload': DOMAIN+'upload-image/product/'
};
var items_list = [], productsSelected = [], storageClients = [];

function init() {
    var analyzer_information = [],
        token = window.localStorage.getItem("rp-token");
    //Automatic Login
    if(token != null) {
        authToken();
    }

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


    //Functions
    $.mobile.selectmenu.prototype.options.nativeMenu = false;

    function pageClientShow() {
        $('.products_clients_add').html('');
        var html = "";
        var products = JSON.parse(localStorage.getItem('products_inventory'));
        for(var i in products) {
            html += '<li>\
                        <a href="#" data-role="button" class="productSelected" data-id="'+products[i].id+'" data-selected="false">\
                            <img src="'+DOMAIN+products[i].model_image+'">\
                            <span>'+products[i].product_name+'</span>\
                        </a>\
                    </li>'
        }
        $('.products_clients_add').append(html);
        $('.products_clients_add').trigger('create');
    }

    function goProduct() {
        if(localStorage.getItem('clientSelected')){
            $.mobile.navigate("#pagina13");
        }
        else{
            alert('Chooce Someone!');
        }
    }

    function selectProduct(e) {
        e.preventDefault();
        var products = JSON.parse(localStorage.getItem('products_inventory')),
            clientSelected = JSON.parse(localStorage.getItem('clientSelected')),
            currentPrice = parseInt($('.see_more_products_clients').text()),
            productSelected,
            id = $(this).data('id');
        var span = $(this).children('.ui-btn-inner');
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
                        'model_image': products[i].model_image
                    };
                    clientSelected.products.push(productSelected);
                    $(this).data('selected',true);
                    $(span).addClass("productSelected");
                    clientSelected.total = clientSelected.total + currentPrice;
                    $('.see_more_products_clients').text(clientSelected.total);
                    localStorage.setItem("clientSelected", JSON.stringify(clientSelected));
                    break;
                }
            //Remove Products to LocalStorage
            } else {
                var remove = -1
                $.each(clientSelected.products, function(i, value){
                    if(value.id == id){
                        remove = i
                    }
                });
                if(remove > -1) {
                    clientSelected.products.splice(remove, 1);
                    localStorage.setItem("clientSelected", JSON.stringify(clientSelected));
                    $(this).data('selected',false);
                    $(span).removeClass("productSelected");
                    break;
                }
            }
        }
    }
    function saveClientStorage() {
        var clientSelected = JSON.parse(localStorage.getItem('clientSelected'));

        if(clientSelected.products != null){
            //validar si esta repetido
            storageClients.push(clientSelected);
        }
        else{
            alert('Chooce Products');
        }

    }

    function calculatePrice(product) {
        //business client -> wholesale 1
        //consumer -> retail 2
        var clientSelected = JSON.parse(localStorage.getItem('clientSelected')),
            price =0;
        if(clientSelected.type === 1) {
            price = product.wholesale_price;
        }
        else if(clientSelected.type === 2) {
            price = product.retail_price;
        }
        return price;
    }

    function loginAuth(event) {
        event.preventDefault();
        var result = checkConnection(Connection.ETHERNET);
        if(result ==  true){
            var url = urls.login;
            $.ajax({
                url: url,
                data: {
                    password: $('#password').val(),
                    email: $('#username').val()
                },
                type: 'POST',
                dataType: 'json',
                success: function (data) {
                    if (data.status === 'OK') {
                        window.localStorage.setItem("rp-token", data.token);
                        token = data.token;
                        eventsAfterLogin();
                    } else {
                        $('.overlay').fadeIn().children().addClass('effect_in_out');
                    }
                }
            });
        } else {
            alert('Check your internet connection')
        }
    }
    
    function listClients() {
        var url = urls.clients_list;
        var a = true;
        var clients_name_id = [];
        $.ajax({
           url: url,
           type: 'POST',
           data: {
                rp_token: token
           },
           dataType: 'json',
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
                $(":radio").bind("change", function (event){
                    var self = $(this);
                    for(var client in items_list){
                        if(storageClients != ''){
                            var result = false;
                            $.each(storageClients, function(i, value) {
                                if(value.id === self.data('id')){
                                    localStorage.setItem("clientSelected", JSON.stringify(storageClients[client]));
                                    clientSelected = JSON.parse(localStorage.getItem('clientSelected'));
                                    $.mobile.navigate("#pagina12");
                                    result = true;
                                }
                            });
                            if(result == false) {
                                var clientSelected = createNewClient(items_list[client])
                            }
                        } else {
                            if(items_list[client].id == $(this).data('id')){
                                var clientSelected = createNewClient(items_list[client]);
                            }
                        }
                    }
                    //pintar select con las lista de clientes de la pagina 12
                    $('#selectClient').html('');
                    var html ='';
                    var html = '<option value="'+clientSelected.id+'">'+clientSelected.name+'</option>';   
                    for(var i in items_list){
                        if(items_list[i].id !== clientSelected.id){
                            html +='<option value="'+items_list[i].id+'">'+items_list[i].name+'</option>';   
                        }
                    }
                    $('#selectClient').append(html);
                    $('#selectClient-button > span > span > span').text(clientSelected.name);

                    localStorage.setItem("clientSelected", JSON.stringify(clientSelected));
                    if(clientSelected.products == ''){
                        $.mobile.navigate("#pagina13");
                    }
                });             
            }
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

    function logOut(event) {
        // localStorage.clear('products_inventory');
        event.preventDefault();
        window.localStorage.removeItem("rp-token");
        $.mobile.navigate("#pagina1");
    }

    function authToken() {
        event.preventDefault();
        var result = checkConnection();
        if(result ==  true){
            var url = urls.loginToken;
            $.ajax({
                url: url,
                data: {
                    token: token
                },
                type: 'POST',
                dataType: 'json',
                success: function (data) {
                    if (data.status === 'OK') {
                        window.localStorage.setItem("rp-token", data.token);
                        token = data.token;
                        eventsAfterLogin();
                    }
                    else {
                        $('.overlay').fadeIn().children().addClass('effect_in_out');
                    }
                }
            });
        } else {
            alert('Check your internet connection')
        }
    }

    function eventsAfterLogin() {
        getInventoryItems();
        getAnalyzerInformation();
        $.mobile.navigate("#pagina2");
    }

    function getInventoryItems() {
        var url = urls.inventory;
        $.ajax({
           url: url,
           type: 'POST',
           data: {
                rp_token: token
           },
           dataType: 'json',
           success: function(data){
                var ul_for_inserting = $('#pagina2').find('.tab1').find('ul'),
                    html_to_insert = '';
                    items_list = data.items_list;
                    
               $.each(items_list, function(i, model){
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
               localStorage.setItem('products_inventory', JSON.stringify(data.items_list));
               $('.model-data').live('click', showDetail);
           }
        });
    }

    function getAnalyzerInformation() {
        var url = urls.analyzer;
        $.ajax({
           url: url,
           type: 'POST',
           data: {
                rp_token: token
           },
           dataType: 'json',
           success: function(data){
               analyzer_information = data.context['information'];
               processAnalyzerInformation(1);
           }
        });
    }
                    
    function showInvoice() {
        if(localStorage.getItem('clientSelected')){
            $('#selectClient').html('');
            var clientSelected = JSON.parse(localStorage.getItem('clientSelected'));
            var clients = JSON.parse(localStorage.getItem('clients'));
            var html ='';
            var html = '<option value="'+clientSelected.id+'">'+clientSelected.name+'</option>';   
            for(var i in clients){
                if(clients[i].id !== clientSelected.id){
                    html +='<option value="'+clients[i].id+'">'+clients[i].name+'</option>';   
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

    function changeTab() {
        var newSelection = $(this).find('a').data('tab-class');
        var prevSelection = 'tab1';
        if(newSelection == 'tab1'){
            prevSelection = 'tab2';
        }
        $("."+prevSelection).addClass("ui-screen-hidden");
        $("."+newSelection).removeClass("ui-screen-hidden");
        prevSelection = newSelection;
    }

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

        if($(this).data('json') != 't'){
            var collapse = $(this).children('div');
            var url = urls.category;
            $.ajax({
                url: url,
                type: 'POST',
                data: {
                    rp_token: token,
                    id: $(this).data('id')
                },
                dataType: 'json',
                success: function (data) {
                    $.each(data.categories, function(i, value) {
                        collapse.prepend('' +
                            '<div data-role="collapsible" data-theme="c" class="option-expand" data-id="'+value.id+'" data-content-theme="c"> ' +
                            '<h3>'+value.name+'</h3>' +
                            '<div data-role="collapsible-set" >' +
                            '</div> </div>');
                        });
                        collapse.collapsibleset().trigger('create');
                }
            });
            $(this).data('json', 't');
            $(this).removeClass('option-expand');
            $(this).addClass('option-collapse');
            $(this).children('div').children('div').collapsibleset().trigger('create');
        }
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
                success: function(data){
                    if(data.status.status == true){
                        eventsAfterLogin();
                    } else {
                        alert('an error occurred');
                    }

                }
            });
        } else {
            alert('Data Incomplete');
        }
    }

    function getInformationProduct() {
        var url = urls.productInformation;
        $.ajax({
            url: url,
            type: 'POST',
            data:{
                rp_token: token
            },
            dataType: 'json',
            success: function(data){
                $.each(data.products, function(i, value) {
                    $('#browsers').append('<option data-id="'+value.id+'" value="'+value.name+'">')
                });

                $.each(data.categories, function(i, value) {
                    $('#categories-list').append('' +
                        '<div data-role="collapsible" class="option-expand" data-theme="c" data-id="'+value.id+'" data-content-theme="c">' +
                        '<h3>'+value.name+'</h3>' +
                        '</div>');
                });

                localStorage.setItem('information', JSON.stringify(data));
            }
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
        var information = localStorage.getItem('information');
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
        result = [{
            Name:"Resume", Sale:total_sales, Profit:total_profit
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
        var margin = {top: 20, right: 20, bottom: 30, left: 40}, width = 960 - margin.left - margin.right, height = 500 - margin.top - margin.bottom;
        var x0 = d3.scale.ordinal().rangeRoundBands([0, width], .1);
        var x1 = d3.scale.ordinal();
        var y = d3.scale.linear().range([height, 0]);
        var color = d3.scale.ordinal().range(["#98abc5", "#8a89a6"]);
        var xAxis = d3.svg.axis().scale(x0).orient("bottom");
        var yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(d3.format(".2s"));
        var svg = d3.select("#graphic").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        function create_graphic(data) {
          /* EXAMPL DATA :
            data =[{Name: "Fisrt", Sale: "12354", Profit: "1054"},
                   {Name: "Second", Sale: "3354", Profit: "1454"},
                   {Name: "Third", Sale: "1454", Profit: "854"}];

            call: create_graphic(data);
          */
          var typeNames = d3.keys(data[0]).filter(function(key) { return key !== "Name"; });

          data.forEach(function(d) {
            d.ages = typeNames.map(function(name) { return {name: name, value: +d[name]}; });
          });

          x0.domain(data.map(function(d) { return d.Name; }));
          x1.domain(typeNames).rangeRoundBands([0, x0.rangeBand()]);
          y.domain([0, d3.max(data, function(d) { return d3.max(d.ages, function(d) { return d.value; }); })]);

          svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);

          svg.append("g").attr("class", "y axis").call(yAxis).append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("$ (Dollars)");

          var state = svg.selectAll(".state")
              .data(data)
              .enter().append("g")
              .attr("class", "g")
              .attr("transform", function(d) { return "translate(" + x0(d.Name) + ",0)"; });

          state.selectAll("rect").data(function(d) { return d.ages; }).enter().append("rect")
              .attr("width", x1.rangeBand())
              .attr("x", function(d) { return x1(d.name); })
              .attr("y", function(d) { return y(d.value); })
              .attr("height", function(d) { return height - y(d.value); })
              .style("fill", function(d) { return color(d.name); });

          var legend = svg.selectAll(".legend").data(typeNames.slice().reverse()).enter().append("g").attr("class", "legend").attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

          legend.append("rect").attr("x", width - 18).attr("width", 18).attr("height", 18).style("fill", color);
          legend.append("text").attr("x", width - 24).attr("y", 9).attr("dy", ".35em").style("text-anchor", "end").text(function(d) { return d; });
        }
        create_graphic(data_graphic);
    }

    function pageMyProductsShow() {
        $('#theDate').val(getDateMonthYear());
        var myProducts = JSON.parse(localStorage.getItem('clientSelected')).products,
            ul_for_my_products = $('#myProducts');
        ul_for_my_products.html('');
        var html = '';
        for(var i in myProducts){
            html += '<li class="without_radious" data-id="'+myProducts[i].id+'">\
                        <a href="">\
                            <img src="'+DOMAIN+myProducts[i].model_image+'" class="ui-li-icon">\
                            <span class="ui-li-aside">'+myProducts[i].product_name+'</span><span class="ui-li-aside qtyInvoice" contenteditable="true" >'+myProducts[i].quantity+'</span>\
                            <span class="ui-li-aside">'+myProducts[i].price+'</span>\
                            <span class="removeProduct">X</span>\
                        </a>\
                    </li>';
        }
        ul_for_my_products.append(html);
        ul_for_my_products.trigger('create');
    }
    function removeMyProduct() {
         console.log('elimiar');
    }

    function updateMyProduct() {
        var myProducts = JSON.parse(localStorage.getItem('clientSelected')).products,
            idProduct = 1,
            quantity = $(this).html();

        $.each(myProducts, function(i, value){
             if(value.id == idProduct) {
                 var unidPrice = value.price / value.quantity
                 value.quantity = quantity;
                 value.price = unidPrice * quantity;
             }
        });
        localStorage.setItem("clientSelected", JSON.stringify(clientSelected));
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
        var networkState = navigator.network.connection.type;

        if(networkState == Connection.NONE){
            return false;
        }
        return true;
    }

    function takePicture(event) {
        event.preventDefault();
        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI
        });
    }

    function onSuccess(imageURI) {
        var image = document.getElementById('image-camera');
        uploadPhoto(imageURI);
        image.src = imageURI;
    }

    function onFail(message) {
        alert('Failed because: ' + message);
    }

    function uploadPhoto(imageURI) {
        var options = new FileUploadOptions();
        options.fileKey="file";
        options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
        options.mimeType="image/jpeg";

        var params = new Object();
        params.value1 = "test";
        params.value2 = "param";

        options.params = params;

        var ft = new FileTransfer();
        ft.upload(imageURI, encodeURI(urls.upload), win, fail, options);
    }

    function win(r) {
        alert('Win');
//        console.log("Code = " + r.responseCode);
//        console.log("Response = " + r.response);
//        console.log("Sent = " + r.bytesSent);
    }

    function fail(error) {
        //alert("An error has occurred: Code = " + error.code);
    }
}

// storageClients = [
        //     {
        //         'id':'id',
        //         'name':'name',
        //         'image':'image',
        //         'type':'type',
        //         'products':[
        //             {'name':'manzana','precio':89, 'cantidad':45, 'image':'aa.png'},
        //             {'name':'manzana','precio':89, 'cantidad':45, 'image':'aa.png'},
        //             {'name':'manzana','precio':89, 'cantidad':45, 'image':'aa.png'},
        //             {'name':'manzana','precio':89, 'cantidad':45, 'image':'aa.png'}
        //         ],
        //         'total':454  
        //     }
        // ]
