(function () {
    'use strict';

    angular.module('starter', ['ionic']) //

    .controller('LoginCtrl', function ($scope, $ionicPopup) {
        //$scope.tasks = [
        //  { title: 'Collect coins' },
        //  { title: 'Eat mushrooms' },
        //  { title: 'Get high enough to grab the flag' },
        //  { title: 'Find the Princess' }
        //];
        $scope.auth = {
            username : "",
            password : "",
            email : ""
        };
        

        //$scope.

        $scope.login = function () {
            if ($scope.auth.username != "jesusgsancheze") {
                //redirect
                var alertPopup = $ionicPopup.alert({
                    title: 'Auth',
                    template: 'Invalid User-Password'
                });

                alertPopup.then(function (res) {
                    //console.log('Thank you for not eating my delicious ice cream cone');
                });
            } else {
                window.location.href = "wall2.html";
            }
        }
        $scope.register = function () {
            //redirect
            var alertPopup = $ionicPopup.alert({
                title: 'Auth',
                template: 'Registration completed'
            });

            alertPopup.then(function (res) {
                window.location.href = "login.html";
            });
        }
    });

    //angular.module("Hi5.controllers").controller('LoginCtrl', [LoginCtrl]);

    //function LoginCtrl($scope) {
    //    $scope.tasks = [
    //      { title: 'Collect coins' },
    //      { title: 'Eat mushrooms' },
    //      { title: 'Get high enough to grab the flag' },
    //      { title: 'Find the Princess' }
    //            ];
    //}

})();

