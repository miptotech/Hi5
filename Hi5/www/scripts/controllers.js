angular.module('starter.controllers', [])

.controller('LoginCtrl', function ($scope, auth, $state, store, $http, Session) {
    var url_base = store.get('url_base');
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
                url: url_base+'get_user_exist.php',
                params: {
                    email: profile.email
                }
            }).then(function successCallback(response) {
                if (response.data === "0") {
                    var FormData = {
                        'name': profile.name,
                        'email': profile.email,
                        'picture': profile.picture
                    };
                    $http({
                        method: 'GET',
                        url: url_base+'post_user_create.php',
                        params: FormData,
                    }).then(function successCallback(response) {
                        var session = {
                            //'id': response.data.id,
                            'name': profile.name,
                            'email': profile.email,
                            'picture': profile.picture
                        }

                        store.set('session', session);

                        Session.set(response.data.id, 'id');
                        Session.set(profile.name, 'name');
                        Session.set(profile.email, 'email');
                        Session.set(profile.picture, 'picture');

                        $state.go('app.wall');
                    }, function errorCallback(response) {

                    });
                } else {
                    $http({
                        method: 'GET',
                        url: url_base+'get_user_info.php',
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

                        Session.set(response.data.id, 'id');
                        Session.set(response.data.name, 'name');
                        Session.set(response.data.email, 'email');
                        Session.set(response.data.picture, 'picture');

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

.controller('AppCtrl', function ($scope, auth, store, $state, Session) {
    //$scope.session = store.get('session');
    $scope.session = Session.value;
    
    $scope.showMessagebtn = true;
    $scope.logout = function () {
        auth.signout();
        store.remove('token');
        store.remove('profile');
        store.remove('refreshToken');
        store.remove('session');
        Session.clear();
        //$state.go('login', {}, { reload: true });
        $state.go('init', {}, { reload: true });
    };
})

.controller('WallCtrl', function ($scope) {

})

.controller('ProfileCtrl', function ($scope, $http, auth, store, $ionicPopup, Session) {
    var url_base = store.get('url_base');
    //$scope.session = store.get('session');
    $scope.session = Session.value;

    $scope.editable = false;

    $scope.update_user = function () {
        $http({
            method: 'GET',
            url: url_base + 'put_user_update.php',
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
                store.set('session', $scope.session);
                //Session.set(profile.name, 'name');
                //Session.set(profile.email, 'email');
                //Service.set(profile.picture, 'picture');
            });
        }, function errorCallback(response) {

        });
    }
})

.controller('GroupCtrl', function ($scope) {

})

.controller('FriendCtrl', function ($scope, $http, store, $ionicPopup, Session) {
    var url_base = store.get('url_base');
    //$scope.session = store.get('session');
    $scope.session = Session.value;
    $scope.list = [];

    $http({
        method: 'GET',
        url: url_base+'get_friends.php',
        params: {
            'id': $scope.session.id
        },
    }).then(function successCallback(response) {
        $scope.list = response.data;
    }, function errorCallback(response) {

    });
})

.controller('SearchNewFriendCtrl', function ($scope, $http, store, $ionicPopup, Session) {
    var url_base = store.get('url_base');
    //$scope.session = store.get('session');
    $scope.session = Session.value;
    $scope.list = [];
    $scope.data = {
        search: ""
    }

    $scope.get_users = function (e, search) {
        var charCode = (e.which) ? e.which : e.keyCode;
        $http({
            method: 'GET',
            url: url_base + 'get_contact.php',
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
        $http({
            method: 'GET',
            url: url_base + 'post_add_friend.php',
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
})
.controller('SearchFriendCtrl', function ($scope, $http, store,$state, $ionicPopup, Session) {
    var url_base = store.get('url_base');
    //$scope.session = store.get('session');
    $scope.session = Session.value;
    //$scope.selectedFriend = Session.friend;
    $scope.list = [];
    $scope.data = {
        search: ""
    }

    $scope.list = [];

    $http({
        method: 'GET',
        url: url_base + 'get_friends.php',
        params: {
            'id': $scope.session.id
        },
    }).then(function successCallback(response) {
        $scope.list = response.data;
    }, function errorCallback(response) {

    });

    $scope.select_friend = function (row) {
        Session.select_friend(row.id, 'id');
        Session.select_friend(row.email, 'email');
        Session.select_friend(row.name, 'name');
        Session.select_friend(row.picture, 'picture');

        $state.go('app.message');
    }
})

.controller('MessageCtrl', function ($scope, $http, store, $state, $ionicPopup, Session) {
    var url_base = store.get('url_base');
    //$scope.session = store.get('session');
    $scope.session = Session.value;

    Session.clear_friend();
    $scope.friend = Session.friend;

    $scope.hi5_check = false;
    $scope.message = "";
    $scope.url_img = "";

    $scope.post_message = function () {
        $http({
            method: 'GET',
            url: url_base + 'post_add_post.php',
            params: {
                'id': $scope.session.id,
                'idFriend': Session.friend.id,
                'hi5_check': $scope.hi5_check,
                'message': $scope.message
            },
        }).then(function successCallback(response) {
            //console.log(response);
            var alertPopup = $ionicPopup.alert({
                title: 'Message Added!',
                template: 'Successfully!'
            });
            alertPopup.then(function (res) {
                $state.go('app.wall');
            });
        }, function errorCallback(response) {

        });
    }
});