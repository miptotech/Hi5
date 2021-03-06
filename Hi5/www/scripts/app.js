
angular.module('starter', ['ionic', 'angular-storage', 'angular-jwt', 'auth0', 'starter.controllers', 'starter.services'])

.run(function ($ionicPlatform) {
    //console.log("pass run 1");

    $ionicPlatform.ready(function () {
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
    $ionicPlatform.registerBackButtonAction(function () {
        //navigator.app.exitApp();
    }, 100);
    //if (window.cordova && window.cordova.plugins.Keyboard) {a
        //...
    //}
})

.config(function ($stateProvider, $urlRouterProvider, authProvider, jwtInterceptorProvider, $httpProvider, $ionicConfigProvider) {
   // console.log("pass config");

    $ionicConfigProvider.views.maxCache(0);
    $stateProvider
        .state('init', {
            url: "/init",
            templateUrl: "templates/init.html"
        })
        .state('login', {
            url: "/login",
            templateUrl: "templates/login.html",
            controller: 'LoginCtrl'
        })
        .state('app', {
            url: "/app",
            abstract: true,
            templateUrl: "templates/app.html",
            controller: 'AppCtrl',
            data: {
                requiresLogin: true
            }
        })
        .state('app.wall', {
            url: '/wall',
            views: {
                'menuContent': {
                    templateUrl: "templates/wall.html",
                    controller: 'WallCtrl'
                }
            }
        })
        .state('app.profile', {
            url: '/profile',
            views: {
                'menuContent': {
                    templateUrl: "templates/profile.html",
                    controller: 'ProfileCtrl'
                }
            }
        })
        .state('app.groups', {
            url: '/groups',
            views: {
                'menuContent': {
                    templateUrl: "templates/groups.html",
                    controller: 'GroupCtrl'
                }
            }
        })
        .state('app.friends', {
            url: '/friends',
            views: {
                'menuContent': {
                    templateUrl: "templates/friends.html",
                    controller: 'FriendCtrl'
                }
            }
        })

        .state('app.searchnewfriend', {
            url: '/searchnewfriend',
            views: {
                'menuContent': {
                    templateUrl: "templates/searchnewfriend.html",
                    controller: 'SearchNewFriendCtrl'
                }
            }
        })

        .state('app.searchfriend', {
            url: '/searchfriend',
            views: {
                'menuContent': {
                    templateUrl: "templates/searchfriend.html",
                    controller: 'SearchFriendCtrl'
                }
            }
        })

        .state('app.message', {
            url: '/message',
            views: {
                'menuContent': {
                    templateUrl: "templates/message.html",
                    controller: 'MessageCtrl'
                }
            }
        })

        .state('app.configuration', {
            url: '/configuration',
            views: {
                'menuContent': {
                    templateUrl: "templates/configuration.html",
                    controller: 'ConfigCtrl'
                }
            }
        })

        .state('app.comment', {
            url: '/comment?postid',
            views: {
                'menuContent': {
                    templateUrl: "templates/comment.html",
                    controller: 'CommentCtrl'
                }
            }
        })

        .state('app.addgroup', {
            url: '/addgroup',
            views: {
                'menuContent': {
                    templateUrl: "templates/addgroup.html",
                    controller: 'AddGroupCtrl'
                }
            }
        })

        .state('app.detailgroup', {
            url: '/detailgroup?groupid',
            views: {
                'menuContent': {
                    templateUrl: "templates/detailgroup.html",
                    controller: 'DetailGroupCtrl'
                }
            }
        })

        .state('app.addfriendgroup', {
            url: '/addfriendgroup?groupid',
            views: {
                'menuContent': {
                    templateUrl: "templates/addfriendgroup.html",
                    controller: 'AddFriendGroupCtrl'
                }
            }
        })

        .state('app.groupwall', {
            url: '/groupwall?groupid',
            views: {
                'menuContent': {
                    templateUrl: "templates/groupwall.html",
                    controller: 'GroupWallCtrl'
                }
            }
        })

        .state('app.searchgroup', {
            url: '/searchgroup',
            views: {
                'menuContent': {
                    templateUrl: "templates/searchgroup.html",
                    controller: 'SearchGroupCtrl'
                }
            }
        })

        .state('app.userwall', {
            url: '/userwall',
            views: {
                'menuContent': {
                    templateUrl: "templates/userwall.html",
                    controller: 'UserWallCtrl'
                }
            }
        });

    // if none of the above states are matched, use this as the fallback
    //$urlRouterProvider.otherwise('/init');
    $urlRouterProvider.otherwise('/app/wall');

    // Configure Auth0
    authProvider.init({
        domain: AUTH0_DOMAIN,
        clientID: AUTH0_CLIENT_ID,
        callbackURL: AUTH0_CALLBACK_URL,
        loginState: 'init'
    });

    jwtInterceptorProvider.tokenGetter = function (store, jwtHelper, auth) {
        var idToken = store.get('token');
        var refreshToken = store.get('refreshToken');
        if (!idToken || !refreshToken) {
            return null;
        }
        if (jwtHelper.isTokenExpired(idToken)) {
            return auth.refreshIdToken(refreshToken).then(function (idToken) {
                store.set('token', idToken);
                return idToken;
            });
        } else {
            return idToken;
        }
    }

    $httpProvider.interceptors.push('jwtInterceptor');
    //---------------------------------------------------------------------------
    //Replacement of jQuery.param
    var serialize = function (obj, prefix) {
        var str = [];
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                str.push(typeof v == "object" ?
                  serialize(v, k) :
                  encodeURIComponent(k) + "=" + encodeURIComponent(v));
            }
        }
        return str.join("&");
    };

    $httpProvider.defaults.transformRequest = function (data) {
        if (data === undefined) {
            return data;
        }
        return serialize(data);
    };
    // set all post requests content type
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';

}).run(function ($rootScope, auth, store, jwtHelper, $location, $state, $http, Session) {
    //var url_base = "http://localhost/hi5/";
    var url_base = "http://mipto.com/hi5/";
    store.set('url_base', url_base);

    //This hooks all auth avents
    auth.hookEvents();
    var refreshingToken = null;

    //console.log("pass run 2");
    $rootScope.$on('$locationChangeStart', function () {
        var token = store.get('token');
        var refreshToken = store.get('refreshToken');
        if (token) {
            if (!jwtHelper.isTokenExpired(token)) {
                if (!auth.isAuthenticated) {
                    auth.authenticate(store.get('profile'), token);
                    var profile = store.get('profile');
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
                            'picture': response.data.picture,
                            'gender': response.data.gender,
                            'birthday': response.data.birthday
                        }
                        store.set('session', session);
                        Session.set(response.data.id, 'id');
                        Session.set(response.data.name, 'name');
                        Session.set(response.data.email, 'email');
                        Session.set(response.data.picture, 'picture');
                        Session.set(response.data.gender, 'gender');
                        Session.set(response.data.birthday, 'birthday');

                        $state.go('app.wall');

                    }, function errorCallback(response) {


                    });
                }
            } else {
                if (refreshToken) {
                    if (refreshingToken === null) {
                        refreshingToken = auth.refreshIdToken(refreshToken).then(function (idToken) {
                            store.set('token', idToken);
                            auth.authenticate(store.get('profile'), idToken);
                            var profile = store.get('profile');
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
                                    'picture': response.data.picture,
                                    'gender': response.data.gender,
                                    'birthday': response.data.birthday
                                }
                                store.set('session', session);
                                Session.set(response.data.id, 'id');
                                Session.set(response.data.name, 'name');
                                Session.set(response.data.email, 'email');
                                Session.set(response.data.picture, 'picture');
                                Session.set(response.data.gender, 'gender');
                                Session.set(response.data.birthday, 'birthday');

                                $state.go('wall');

                            }, function errorCallback(response) {

                            });
                        }).finally(function () {
                            refreshingToken = null;
                        });
                    }
                    return refreshingToken;
                } else {
                    $location.path('/init');
                    //$state.on('init');
                }
            }
        }
    });

    //$rootScope.$on('$locationChangeStart', function () {
    //    if (!auth.isAuthenticated) {
    //        var token = store.get('token');
    //        if (token) {
    //            auth.authenticate(store.get('profile'), token);
    //            $state.go('app.wall');
    //        }
    //    }
    //});
});