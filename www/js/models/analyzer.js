var AnalyzerModel = function(buyerInventoryFactory) {
	var model= this;
	model.messages = [];
	model.graphic_month = false;
	model.graphic_week = false;
	model.graphic_day = false;
	model.info = [];
	model.refresh_data_neccesary = true;
	model.current_type = 0;

	/* start graphic only work in this div */
	model.id_div_source_graphic = 'content_init_graphic';
	model.prefix_jqplot = 'graphic_jqplot_';
	model.prefix_content = 'content_graphic_';
	model.domain = '';

	model.set_domain = function(domain) {
		model.domain = domain;
	};
	
    model.update = function(cache, type) {
    	buyerInventoryFactory.get_analyzer_information(function(info){
    		model.info = info;
    		model.time = buyerInventoryFactory.get_analyzer_information_time();
        	model.clear_graphics();
    		if (!isNaN(parseInt(type))) {
    			$('#graphic_month').trigger('click');
    		}
    	}, cache);
    };
        
    model.clear_graphics = function() {
    	model.graphic_month = false;
		model.graphic_week = false;
		model.graphic_day = false;
		model.current_type = 0;
		$('#' + model.id_div_source_graphic).html('');
      	model.set_div(1);
      	model.set_div(2);
      	model.set_div(3);
      	model.hidden_graphics();
    };
    
    model.set_div = function (type) {
    	var div = $('<div></div>');
    	div.attr('id', model.prefix_jqplot + type);
      	$('#' + model.id_div_source_graphic).append(div);
    };

    model.exists_graphic = function(type) {
		if (type == 1) {
			return model.graphic_month;
		} else if (type == 2) {
			return model.graphic_week;
		} else if (type == 3) {
			return model.graphic_day;
		}
	};
	
	model.set_exists_graphic = function(type, value) {
		if (type == 1) {
			model.graphic_month = value;
		} else if (type == 2) {
			model.graphic_week = value;
		} else if (type == 3) {
			model.graphic_day = value;
		}
	};
	
	model.get_info_by_type = function(type) {
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
            var finish_date = new Date(date.setDate(diff + 6));

        } else if (type == 3) { /* day */
            var initial_date = new Date();
                initial_date = new Date(initial_date.getFullYear(), initial_date.getMonth(), initial_date.getDate());
            var finish_date = new Date();
                finish_date = new Date(finish_date.getFullYear(), finish_date.getMonth(), finish_date.getDate());
        }
        /* TOTALS */
        var total_sales = 0;
        var total_units = 0;
        var total_profit = 0;

        for(var i in model.info['values']) {
            item = model.info['values'][i];
            date = model.get_date_from_string(item['date']);
            if (date >= initial_date && date <= finish_date) {
                total_sales += item['sale_value'];
                total_units += item['sale_volume'];
                total_profit += item['projected_profit'];
            }
        }
        
        /* POPULAR */
        var total_models_data = model.total_models(initial_date, finish_date, model.info['variants']['data']);
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
        
        /* graphic */
        result = [{
            Name:"Resume (" + model.time + ")", Sale:total_sales, Profit:total_profit
        }];
        
        var return_data = {
        	'total_sales': total_sales,
        	'total_units': total_units,
        	'total_profit': total_profit,
        	'popular': popular,
        	'data_graphic': result
        };

        return return_data;
	};
	
	model.show_graphic = function(type) {
		if (model.current_type == type) {
			return false;
		}
		model.current_type = type; 
		var info_type = model.get_info_by_type(type);
		if (model.exists_graphic(type)) {
			/* show div */
			model.hidden_graphics();
			$('#' + model.prefix_content + type).append($('#' + model.prefix_jqplot + type));
		} else {
			model.hidden_graphics();
			$('#' + model.prefix_content + type).html('');
			$('#' + model.prefix_content + type).trigger('create');
			try{model.create_graphic(info_type['data_graphic'], type);}catch(e){}
			$('#' + model.prefix_content + type).append($('#' + model.prefix_jqplot + type));
		}
		model.show_resume_values(info_type);
    };
    
    model.hidden_graphics = function() {
    	if ($('#' + model.prefix_jqplot + 1).length) {
    		$('#' + model.id_div_source_graphic).append($('#' + model.prefix_jqplot + 1));
    	}
    	if ($('#' + model.prefix_jqplot + 2).length) {
    		$('#' + model.id_div_source_graphic).append($('#' + model.prefix_jqplot + 2));
    	}
    	if ($('#' + model.prefix_jqplot + 3).length) {
    		$('#' + model.id_div_source_graphic).append($('#' + model.prefix_jqplot + 3));
    	}
    };
    
    model.create_graphic = function(data, type) {
        var s1 = [];
        var s2 = [];
	    var ticks = [];
        for(index in data) {
        var item = data[index];
        	s1[s1.length] = item.Profit;
        	s2[s2.length] = item.Sale;
        	ticks[ticks.length] = item.Name;
        }
	    plot2 = $.jqplot(model.prefix_jqplot + type, [s1, s2], {
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
	    model.set_exists_graphic(type, true);
    };
    
    model.show_resume_values = function(info_type) {
    	var total_sales = info_type['total_sales'],
    		total_units = info_type['total_units'],
    		total_profit = info_type['total_profit'],
    		popular = info_type['popular'];

    	$('#pagina2').find('.tab2').find('#analyzer_total_sales').html(total_sales);
        $('#pagina2').find('.tab2').find('#analyzer_total_units').html(total_units);
        $('#pagina2').find('.tab2').find('#analyzer_total_profit').html(total_profit);
        
        if (popular !== false) {
            if (typeof(model.info['variants']['models'][popular['product_model_id']]) != 'undefined') {
                var details = model.info['variants']['models'][popular['product_model_id']];
                $('#pagina2').find('.tab2').find('#most_popular_img').html('<img src="'+model.domain+details['image']+'" />');
                $('#pagina2').find('.tab2').find('#most_popular_name').html(details['name']);
                $('#pagina2').find('.tab2').find('#most_popular_sold').html(popular['quantity']);
            }
        }
	};
	
	model.get_date_from_string = function(string_date) {
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
    };
    
    model.total_models = function(initial_date, finish_date, data) {
        result = {};
        for (var i in data) {
            item = data[i];
            date = model.get_date_from_string(item['date']);
            if (date >= initial_date && date <= finish_date) {
                if (typeof(result[item['product_model_id']]) == 'undefined') {
                    result[item['product_model_id']] = item;
                } else {
                    result[item['product_model_id']]['quantity'] += item['quantity'];
                }
            }
        }
        return result;
    };

	return model;
};
