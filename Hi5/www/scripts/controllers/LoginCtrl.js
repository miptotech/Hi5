(function () {
    'use strict';

    angular.module('Hi5', ['ionic'])

    .controller('TodoCtrl', function ($scope) {
        $scope.tasks = [
          { title: 'Collect coins' },
          { title: 'Eat mushrooms' },
          { title: 'Get high enough to grab the flag' },
          { title: 'Find the Princess' }
        ];
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

