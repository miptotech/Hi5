angular.module('starter.controllers', [])

.controller('LoginCtrl', function ($scope, auth, $state, store, $http) {
    function doAuth() {
        auth.signin({
            closable: false,
            // This asks for the refresh token
            // So that the user never has to log in again
            authParams: {
                scope: 'openid offline_access',
                device: 'Mobile device'
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
                            //'id': response.data.id,
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
                        store.remove('session');
                        var session = {
                            'id': response.data.id,
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
    $scope.session = store.get('session');
    $scope.showMessagebtn = true;
    $scope.logout = function () {
        auth.signout();
        store.remove('token');
        store.remove('profile');
        store.remove('refreshToken');
        store.remove('session');
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

})

.controller('FriendCtrl', function ($scope, $http, store, $ionicPopup) {
    $scope.session = store.get('session');
    $scope.list = [];

    $http({
        method: 'GET',
        url: 'http://localhost/hi5/get_friends.php',
        params: {
            'id': $scope.session.id
        },
    }).then(function successCallback(response) {
        $scope.list = response.data;
    }, function errorCallback(response) {

    });
})

.controller('SearchFriendCtrl', function ($scope, $http, store, $ionicPopup) {
    $scope.session = store.get('session');
    $scope.list = [];
    $scope.data = {
        search: ""
    }

    $scope.get_users = function (e, search) {
        var charCode = (e.which) ? e.which : e.keyCode;
        //search += charCode;
        //console.log(search + String.fromCharCode(charCode));
        $http({
            method: 'GET',
            url: 'http://localhost/hi5/get_contact.php',
            params: {
                'search': search + String.fromCharCode(charCode),
                'email': $scope.session.email
            },
        }).then(function successCallback(response) {
            $scope.list = response.data;
        }, function errorCallback(response) {

        });
    }

    $scope.add_friend = function (row) {
        //console.log(row);
        $http({
            method: 'GET',
            url: 'http://localhost/hi5/post_add_friend.php',
            params: {
                'id': $scope.session.id,
                'idFriend': row.id
            },
        }).then(function successCallback(response) {
            console.log(response);
            var alertPopup = $ionicPopup.alert({
                title: 'Friend Added!',
                template: 'Successfully!'
            });
            alertPopup.then(function (res) {
                var index = $scope.list.indexOf(row);
                $scope.list.splice(index, 1);
            });
        }, function errorCallback(response) {

        });
    }

    //$scope.model = "";
    //$scope.clickedValueModel = "";
    //$scope.removedValueModel = "";

    //$scope.getTestItems = function (query) {
    //    if (query) {
    //        return {
    //            items: [
    //                { id: "1", name: query + "1", view: "view: " + query + "1" },
    //                { id: "2", name: query + "2", view: "view: " + query + "2" },
    //                { id: "3", name: query + "3", view: "view: " + query + "3" }]
    //        };
    //    }
    //    return { items: [] };
    //};
    //$scope.itemsClicked = function (callback) {
    //    $scope.clickedValueModel = callback;
    //};
    //$scope.itemsRemoved = function (callback) {
    //    $scope.removedValueModel = callback;
    //};
})

.controller('MessageCtrl', function ($scope) {
    $scope.hi5_check = false;
});