
var app = {
    getDomain: function() {
        return "http://roypi.com"
        //return "http://192.168.1.6:8000";
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
