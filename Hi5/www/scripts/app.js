
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'auth0', 'angular-storage', 'angular-jwt'])

.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
})

.config(function ($stateProvider, $urlRouterProvider, authProvider, jwtInterceptorProvider, $httpProvider) {
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
}).run(function ($rootScope, auth, store, jwtHelper, $location, $state, $http, Session) {
    //var url_base = "http://localhost/hi5/";
    var url_base = "http://mipto.com/hi5/";
    store.set('url_base', url_base);

    //This hooks all auth avents
    auth.hookEvents();
    var refreshingToken = null;
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
                            'picture': response.data.picture
                        }
                        store.set('session', session);
                        Session.set(response.data.id, 'id');
                        Session.set(response.data.name, 'name');
                        Session.set(response.data.email, 'email');
                        Session.set(response.data.picture, 'picture');
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
                                    'picture': response.data.picture
                                }
                                store.set('session', session);
                                Session.set(response.data.id, 'id');
                                Session.set(response.data.name, 'name');
                                Session.set(response.data.email, 'email');
                                Session.set(response.data.picture, 'picture');
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