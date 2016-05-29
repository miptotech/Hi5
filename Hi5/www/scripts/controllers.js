angular.module('starter.controllers', [])

.controller('LoginCtrl', function ($scope, auth, $state, store, $http) {
    function doAuth() {
        auth.signin({
            closable: false,
            // This asks for the refresh token
            // So that the user never has to log in again
            authParams: {
                scope: 'openid offline_access'
            }
        }, function (profile, idToken, accessToken, state, refreshToken) {
            store.set('profile', profile);
            store.set('token', idToken);
            store.set('refreshToken', refreshToken);

            $http({
                method: 'GET',
                url: 'http://localhost/hi5/get_user_exist.php',
                params: {
                    email: profile.email
                }
            }).then(function successCallback(response) {
                if (response.data == "0") {
                    var FormData = {
                        'name': profile.name,
                        'email': profile.email,
                        'picture': profile.picture
                    };
                    $http({
                        method: 'GET',
                        url: 'http://localhost/hi5/post_user_create.php',
                        params: FormData,
                    }).then(function successCallback(response) {
                        var session = {
                            'name': profile.name,
                            'email': profile.email,
                            'picture': profile.picture
                        }

                        store.set('session', session);

                        $state.go('app.wall');
                    }, function errorCallback(response) {

                    });
                } else {
                    $http({
                        method: 'GET',
                        url: 'http://localhost/hi5/get_user_info.php',
                        params: {
                            'email': profile.email
                        },
                    }).then(function successCallback(response) {
                        var session = {
                            'name': response.data.name,
                            'email': response.data.email,
                            'picture': response.data.picture
                        }
                        store.set('session', session);

                    }, function errorCallback(response) {

                    });

                    $state.go('app.wall');
                }
            }, function errorCallback(response) {

            });

        }, function (error) {
            console.log("There was an error logging in", error);
        });
    }

    $scope.$on('$ionic.reconnectScope', function () {
        doAuth();
    });
    doAuth();
})

.controller('AppCtrl', function ($scope, auth, store, $state) {
    //$scope.auth = auth;
    $scope.session = store.get('session');

    //$scope.data = {
    //    'email': auth.profile.email,
    //    'name': auth.profile.name,
    //    'picture': auth.profile.picture
    //};
    $scope.logout = function () {
        auth.signout();
        store.remove('token');
        store.remove('profile');
        store.remove('refreshToken');
        $state.go('login', {}, { reload: true });
    };
})

.controller('WallCtrl', function ($scope) {

})

.controller('ProfileCtrl', function ($scope, $http, auth, store, $ionicPopup) {
    $scope.session = store.get('session');

    //$http({
    //    method: 'GET',
    //    url: 'http://localhost/hi5/get_user_info.php',
    //    params: {
    //        'email': $scope.session.email
    //    },
    //}).then(function successCallback(response) {
    //    $scope.session.email = response.data.email;
    //    $scope.session.name = response.data.name;
    //    $scope.session.picture = response.data.picture;
    //    //$scope.picture = auth.profile.picture;
    //}, function errorCallback(response) {

    //});

    $scope.editable = false;

    $scope.update_user = function () {
        $http({
            method: 'GET',
            url: 'http://localhost/hi5/put_user_update.php',
            params: {
                'email': $scope.session.email,
                'name': $scope.session.name
            },
        }).then(function successCallback(response) {
            var alertPopup = $ionicPopup.alert({
                title: 'Profile Updated!',
                template: 'Profile Update!'
            });
            alertPopup.then(function (res) {
            });
        }, function errorCallback(response) {

        });
    }
})

.controller('GroupCtrl', function ($scope) {

});