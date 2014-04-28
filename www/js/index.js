
var app = {
    getDomain: function() {
        return "http://royalpioneers.com/";
        //return "http://192.168.0.26:8000";
        //return "http://roypi.com/";
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
