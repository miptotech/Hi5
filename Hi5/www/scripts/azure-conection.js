(function () {
    "use strict";

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener( 'resume', onResume.bind( this ), false );

        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        //var element = document.getElementById("deviceready");
        //element.innerHTML = 'Device Ready';
        //element.className += ' ready';
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };
} )();


angular.module('todo', ['ionic'])

.controller('TodoCtrl', function ($scope) {


    $scope.login = function () {
        //alert("pase");
        //var mobileAppsClient = new WindowsAzure.MobileServiceClient(
        //        "http://localhost:50773/"
        //    );
        client = new WindowsAzure.MobileServiceClient('http://localhost:50773');
        todoItemTable = client.getTable('todoitem');
        

        //var item = { test: 'Item 1', complete: false };
        //mobileAppsClient.getTable('todoitem').insert(item);

        //var todoTable = mobileAppsClient.getTable('TodoItem');
        //console.log(todoTable);
    };

});