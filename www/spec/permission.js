describe('app', function() {
	
	var resourceControl = {
		'tabMyInventory': 'Inventory',
		'tabMyAnalyzer': 'Sales Analyzer',
		'pagina2': 'Inventory',
		'pagina3': 'New Invoice',
		'pagina4': 'Sales Analyzer',
		'pagina5': 'Stores',
		'pagina6': '',
	};
	var permissions = [
	  {
	    "access": true,
	    "name": "Inventory"
	  },
	  {
	    "access": true,
	    "name": "Sales Analyzer"
	  },
	  {
	    "access": false,
	    "name": "New Invoice"
	  },
	  {
	    "access": true,
	    "name": "Stores"
	  }
	];

    describe('permission', function() {
    	var data = simple_clone(permissions);
    	var permissionFactory = new PermissionFactory([], '', true);
    	window.localStorage.setItem(permissionFactory.id_store_permissions, JSON.stringify(data));
    	
    	var permissionModel = PermissionModel(permissionFactory, resourceControl);
    	
    	it('get access ok', function(){
    		result = permissionModel.can_access('tabMyInventory');
    		expect(result).toEqual(true);
    	});
    	
    	it('get access fail', function(){
    		result = permissionModel.can_access('pagina3');
    		expect(result).toEqual(false);
    	});
    	
    	it('get access resource havent control', function(){
    		result = permissionModel.can_access('paginax');
    		expect(result).toEqual(true);
    	});
    	
    	it('get access resource without key', function(){
    		result = permissionModel.can_access('pagina6');
    		expect(result).toEqual(false);
    	});
    });
});
