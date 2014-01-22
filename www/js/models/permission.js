var PermissionModel = function(permissionFactory, accessControl) {
	var model = this;
	model.message = '';
	model.resources = accessControl;

	model.can_access = function(resource) {
		key = model.get_key(resource);
		if (key === false) {
			return true;
		}
		var permissions = permissionFactory.get_current_permissions();
		for (var index in permissions) {
			permission = permissions[index];
			if (permission['name'] == key) {
				return permission['access'];
			}
		}
		return false;
	};
	
	model.get_key = function(resource) {
		for (var id in model.resources) {
			if (id == resource) {
				return model.resources[id];
			}
		}
		return false;
	};
	
	model.get_message = function() {
		var message = model.message;
		model.message = '';
		return message;
	};
	
	return model;
};