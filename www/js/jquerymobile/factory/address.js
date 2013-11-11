var Country = fuction() {
	var factory = {};

	factory.cache = true;
	
	factory.get_all = function() {
		return [];
	};
}

var State = function() {
	var factory = {};
	
	factory.cache = true;

	factory.get_by_country = function(){
		return [];
	};
};


var City = function() {
	var factory = {};

	factory.cache = true;

	factory.get_by_char = function(char){
		return [];
	};
};