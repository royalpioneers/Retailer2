def a(list_features):
	aa = list_features
        list_features = []
        for element in aa:
            import pdb;pdb.set_trace()
            if element['id'] not in list_features:
                list_features.append(element)
        return list_features

print a()