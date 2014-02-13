
var app = {
    getDomain: function() {
        //return "http://roypi.com";
//        return "http://192.168.1.8:8000";
        return "http://127.0.0.1:8000";
    },
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        //Aplicacion activa
    }
};
