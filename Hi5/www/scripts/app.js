
angular.module('starter', ['ionic', 'starter.controllers', 'auth0', 'angular-storage', 'angular-jwt', 'ion-autocomplete'])

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

        .state('app.searchfriends', {
            url: '/searchfriends',
            views: {
                'menuContent': {
                    templateUrl: "templates/searchfriends.html",
                    controller: 'SearchFriendCtrl'
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
        loginState: 'login'
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

}).run(function ($rootScope, auth, store, jwtHelper, $location, $state ) {
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
                }
            } else {
                if (refreshToken) {
                    if (refreshingToken === null) {
                        refreshingToken = auth.refreshIdToken(refreshToken).then(function (idToken) {
                            store.set('token', idToken);
                            auth.authenticate(store.get('profile'), idToken);
                        }).finally(function () {
                            refreshingToken = null;
                        });
                    }
                    return refreshingToken;
                } else {
                    $location.path('/init');// Notice: this url must be the one defined
                    //$state.on('init');// Notice: this url must be the one defined
                }                            // in your login state. Refer to step 5.
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