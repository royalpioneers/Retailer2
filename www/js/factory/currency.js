var CurrencyFactory = function(urls, token, cache) {
    var factory = {};

    factory.cache = cache;
    factory.urls = urls;
    factory.token = token;
    factory.currencies = 'currencies';

    factory.getAll = function() {
        var list = JSON.parse(window.localStorage.getItem(factory.currencies));
        if (list != null) {
            return list;
        }

        $.ajax({
            url: factory.urls.currencies,
            type: 'POST',
            data: {rp_token: factory.token},
            dataType: 'json',
            success: function(data){
                if (data.status == 'ok') {
                    window.localStorage.setItem(factory.currencies, JSON.stringify(data.list));
                    return data.list;
                }
            }
        });
    };

    factory.setToken = function(token) {
        factory.token = token;
    };

    return factory;
};