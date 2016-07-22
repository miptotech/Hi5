angular.module('starter.controllers', [])

.controller('LoginCtrl', function ($scope, auth, $state, store, $http, Session) {
    var url_base = store.get('url_base');
    function doAuth() {
        auth.signin({
            closable: false,
            // This asks for the refresh token
            // So that the user never has to log in againa
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
                    console.log(profile.email);

                    $http({
                        method: 'GET',
                        url: url_base+'get_user_info.php',
                        params: {
                            'email': profile.email
                        },
                    }).then(function successCallback(response) {
                        console.log("pass login");
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
                        console.log("algo paso");
                    });

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
        $state.go('init', {}, {});
    };
})

.controller('WallCtrl', function ($scope, auth, store, $state, $http, Session) {
    console.log("pass Wall");

    var url_base = store.get('url_base');
    var session = store.get('session');
    //$scope.session = store.get('session');

    $scope.session = Session.value;

    $scope.list = [];

    $http({
        method: 'GET',
        url: url_base + 'get_posts.php',
        params: {
            'id': session.id
        },
    }).then(function successCallback(response) {
        if (response.data !== "null") {
            $scope.list = response.data;
        }
    }, function errorCallback(response) {

    });

    $scope.toggleLike = function (row) {
        $http({
            method: 'GET',
            url: url_base + 'get_like_user.php',
            params: {
                'user_id': session.id,
                'post_id': row.id
            },
        }).then(function successCallback(response) {
            if (response.data === "null") {
                $http({
                    method: 'POST',
                    url: url_base + 'post_add_like.php',
                    data: {
                        'user_id': session.id,
                        'post_id': row.id
                    },
                }).then(function successCallback(response) {
                    row.likes = parseInt(row.likes) + 1;
                }, function errorCallback(response) {

                });
            } else {
                $http({
                    method: 'POST',
                    url: url_base + 'put_toggle_like.php',
                    data: {
                        'user_id': session.id,
                        'post_id': row.id
                    },
                }).then(function successCallback(response) {
                    if (response.data !== "-")
                        row.likes = parseInt(row.likes) + 1;
                    else
                        row.likes = parseInt(row.likes) - 1;
                }, function errorCallback(response) {

                });
            }
        }, function errorCallback(response) {

        });
    }

    $scope.userwall = function (row) {
        console.log(row)
        Session.select_friend(row.fid, 'id');
        var username = row.fname.slice(-1);
        if (username == "s") {
            username = row.fname + "'";
        } else {
            username = row.fname + "'s";
        }
        Session.select_friend(username, 'name');

        $state.go('app.userwall');
    }

    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {

        var pictureSource = navigator.camera.PictureSourceType;
        var destinationType = navigator.camera.DestinationType;

        //console.log(destinationType);

        store.set('pictureSource', pictureSource);
        store.set('destinationType', destinationType);
    }
})

.controller('ProfileCtrl', function ($scope, $http, auth, store, $ionicPopup, Session, $state) {
    function pad(str, max) {
        str = str.toString();
        return str.length < max ? pad("0" + str, max) : str;
    }

    var url_base = store.get('url_base');
    //$scope.session = store.get('session');
    $scope.session = Session.value;
    console.log($scope.session);

    $scope.data = {
        preview: "",
        birthday : new Date($scope.session.birthday)
    };

    $scope.editable = false;
    //$scope.birthday = new Date($scope.session.birthday);

    $scope.pictureSource = store.get('pictureSource');
    $scope.destinationType = store.get('destinationType');


    if ($scope.session.gender === "F") {
        $scope.genderName = "Female";
        $scope.gender = true;
    }else{
        $scope.genderName = "Male";
        $scope.gender = false;
    }

    $scope.setGender = function (gender) {
        if (gender) {
            $scope.genderName = "Female";
            $scope.session.gender = "F";
        } else {
            $scope.genderName = "Male";
            $scope.session.gender = "M";
        }
    }

    $scope.getPhoto = function () {
        navigator.camera.getPicture(function (imageURI) {
            // Show the selected image
            $scope.data.preview = imageURI;
            $scope.$apply();

        }, function (message) {
            console.log('Failed because: ' + message);
        }, {
            quality: 50,
            destinationType: $scope.destinationType.FILE_URI,
            sourceType: $scope.pictureSource.PHOTOLIBRARY
        });
    }

    $scope.update_user = function () {

        if ($scope.data.preview) {
            var mm = $scope.data.birthday.getMonth() + 1; // getMonth() is zero-based
            var dd = $scope.data.birthday.getDate();
            var datestr = $scope.data.birthday.getFullYear() + "-" + pad(mm, 2) + "-" + pad(dd, 2);

            //set upload options
            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = $scope.data.preview.substr($scope.data.preview.lastIndexOf('/') + 1);
            options.mimeType = "image/jpeg";

            options.httpMethod = "POST";
            options.headers = {
                Connection: "close"
            };

            options.params = {
                'id': $scope.session.id,
                'name': $scope.session.name,
                'gender': $scope.session.gender,
                'birthday': datestr
            }

            var ft = new FileTransfer();

            ft.upload($scope.data.preview, url_base + 'put_user_update.php', function (r) {
                console.log("Code = " + r.responseCode);
                console.log("Response = " + r.response);
                console.log("Sent = " + r.bytesSent);

                $scope.session.birthday = r.data;

                var alertPopup = $ionicPopup.alert({
                    title: 'Group Created!',
                    template: 'Successfully!'
                });
                alertPopup.then(function (res) {
                    $scope.session.picture = $scope.data.preview;
                    $scope.data.preview = "";
                   
                    //$state.go('app.groups', {}, {});
                    //$state.transitionTo('app.groups', {}, { reload: true, notify: true });
                });
            }, function (error) {
                alert("An error has occurred: Code = " + error.code);
                console.log("upload error source " + error.source);
                console.log("upload error target " + error.target);
            }, options);
        
        } else {

            var mm = $scope.data.birthday.getMonth() + 1; // getMonth() is zero-based
            var dd = $scope.data.birthday.getDate();
            var datestr = $scope.data.birthday.getFullYear() + "-" + pad(mm,2) + "-" + pad(dd,2);

            $http({
                method: 'POST',
                url: url_base + 'put_user_update.php',
                data: {
                    'id': $scope.session.id,
                    'name': $scope.session.name,
                    'gender': $scope.session.gender,
                    'birthday': datestr
                },
            }).then(function successCallback(response) {
                $scope.session.birthday = response.data;
             //   $scope.data.birthday = new Date($scope.sedatassion.birthday);
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
    }

    $scope.userwall = function (row) {
        console.log(row)
        Session.select_friend(row.id, 'id');
        var username = row.name.slice(-1);
        if (username == "s") {
            username = row.name + "'";
        } else {
            username = row.name + "'s";
        }
        Session.select_friend(username, 'name');

        $state.go('app.userwall');
    }
})

.controller('GroupCtrl', function ($scope, $http, store, $ionicPopup, Session) {
    var url_base = store.get('url_base');
    //$scope.session = store.get('session');
    $scope.session = Session.value;
    $scope.list = [];

    $http({
        method: 'GET',
        url: url_base + 'get_groups.php',
        params: {
            'id': $scope.session.id
        },
    }).then(function successCallback(response) {
        $scope.list = response.data;
    }, function errorCallback(response) {

    });
})

.controller('FriendCtrl', function ($scope, $http, store, $ionicPopup, Session, $state) {
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

    $scope.userwall = function (row) {
        console.log(row)
        Session.select_friend(row.id, 'id');
        var username = row.name.slice(-1);
        if (username == "s") {
            username = row.name + "'";
        } else {
            username = row.name + "'s";
        }
        Session.select_friend(username, 'name');

        $state.go('app.userwall');
    }
})

.controller('SearchNewFriendCtrl', function ($scope, $http, store, $ionicPopup, Session) {
    var url_base = store.get('url_base');
    //$scope.session = store.get('session');
    $scope.session = Session.value;
    $scope.list = [];
    $scope.data = {
        search: ""
    }

    $scope.get_users = function (search) {
        $http({
            method: 'GET',
            url: url_base + 'get_contact.php',
            params: {
                'search': $scope.data.search,
                'id': $scope.session.id
            },
        }).then(function successCallback(response) {
            if (response.data !== "null") {
                $scope.list = response.data;
            }
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
            //console.log(response);
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
.controller('SearchFriendCtrl', function ($scope, $http, store, $state, $ionicPopup, Session) {
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

    $scope.get_users = function () {
        //$scope.data.search
    }

    $scope.select_friend = function (row) {
        Session.select_friend(row.id, 'id');
        Session.select_friend(row.email, 'email');
        Session.select_friend(row.name, 'name');
        Session.select_friend(row.picture, 'picture');
        Session.select_friend(true, 'isUser');

        $state.go('app.message');
    }
})

.controller('SearchGroupCtrl', function ($scope, $http, store, $state, $ionicPopup, Session) {
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
        url: url_base + 'get_groups.php',
        params: {
            'id': $scope.session.id
        },
    }).then(function successCallback(response) {
        $scope.list = response.data;
    }, function errorCallback(response) {

    });

    $scope.get_users = function () {
        //$scope.data.search
    }

    $scope.select_group = function (row) {
        Session.select_friend(row.id, 'id');
        Session.select_friend(row.email, '');
        Session.select_friend(row.name, 'name');
        Session.select_friend(row.picture, 'picture');
        Session.select_friend(false, 'isUser');

        $state.go('app.message');
    }
})

.controller('MessageCtrl', function ($scope, $http, store, $state, $ionicPopup, Session, $ionicHistory) {
    var url_base = store.get('url_base');
    //$scope.session = store.get('session');
    $scope.session = Session.value;

    //Session.clear_friend();
    $scope.friend = Session.friend;

    $scope.msg = {
        hi5_check : false,
        message : "",
        url_img : ""
    };

    $ionicHistory.nextViewOptions({
        disableBack: true
    });

    $scope.pictureSource = store.get('pictureSource');
    $scope.destinationType = store.get('destinationType');

    $scope.getPhoto = function () {
        navigator.camera.getPicture(function (imageURI) {
            // Show the selected image
            $scope.msg.url_img = imageURI;
            $scope.$apply();

        }, function (message) {
            console.log('Failed because: ' + message);
        }, {
            quality: 50,
            destinationType: $scope.destinationType.FILE_URI,
            sourceType: $scope.pictureSource.PHOTOLIBRARY
        });
    }

    $scope.post_message = function () {
        if (Session.friend.isUser) {
            //set upload options
            if ($scope.msg.url_img) {

                var options = new FileUploadOptions();
                options.fileKey = "file";
                options.fileName = $scope.msg.url_img.substr($scope.msg.url_img.lastIndexOf('/') + 1);
                options.mimeType = "image/jpeg";

                options.httpMethod = "POST";
                options.headers = {
                    Connection: "close"
                };

                options.params = {
                    'id': $scope.session.id,
                    'idFriend': Session.friend.id,
                    'hi5_check': $scope.msg.hi5_check,
                    'message': $scope.msg.message
                }

                var ft = new FileTransfer();

                ft.upload($scope.msg.url_img, url_base + 'post_add_post.php', function (r) {
                    console.log("Code = " + r.responseCode);
                    console.log("Response = " + r.response);
                    console.log("Sent = " + r.bytesSent);

                    var alertPopup = $ionicPopup.alert({
                        title: 'Message Added!',
                        template: 'Successfully!'
                    });
                    alertPopup.then(function (res) {
                        $state.go('app.wall', {}, {});
                        //$state.transitionTo('app.groups', {}, { reload: true, notify: true });
                    });
                }, function (error) {
                    alert("An error has occurred: Code = " + error.code);
                    console.log("upload error source " + error.source);
                    console.log("upload error target " + error.target);
                }, options);
                
            } else {
                $http({
                    method: 'POST',
                    url: url_base + 'post_add_post.php',
                    data: {
                        'id': $scope.session.id,
                        'idFriend': Session.friend.id,
                        'hi5_check': $scope.msg.hi5_check,
                        'message': $scope.msg.message
                    },
                }).then(function successCallback(response) {
                    console.log(response);
                    var alertPopup = $ionicPopup.alert({
                        title: 'Message Added!',
                        template: 'Successfully!'
                    });
                    alertPopup.then(function (res) {
                        $state.go('app.wall');
                        //$state.transitionTo('app.wall', {}, { reload: true, notify: true });
                    });
                }, function errorCallback(response) {

                });

            }
        } else {
            //set upload options
            if ($scope.msg.url_img) {

                var options = new FileUploadOptions();
                options.fileKey = "file";
                options.fileName = $scope.msg.url_img.substr($scope.msg.url_img.lastIndexOf('/') + 1);
                options.mimeType = "image/jpeg";

                options.httpMethod = "POST";
                options.headers = {
                    Connection: "close"
                };

                options.params = {
                    'id': $scope.session.id,
                    'group_id': Session.friend.id,
                    'hi5_check': $scope.msg.hi5_check,
                    'message': $scope.msg.message
                }

                var ft = new FileTransfer();

                ft.upload($scope.msg.url_img, url_base + 'post_add_group_post.php', function (r) {
                    console.log("Code = " + r.responseCode);
                    console.log("Response = " + r.response);
                    console.log("Sent = " + r.bytesSent);

                    var alertPopup = $ionicPopup.alert({
                        title: 'Message Added!',
                        template: 'Successfully!'
                    });
                    alertPopup.then(function (res) {
                        $state.go('app.wall', {}, {});
                        //$state.transitionTo('app.groups', {}, { reload: true, notify: true });
                    });
                }, function (error) {
                    alert("An error has occurred: Code = " + error.code);
                    console.log("upload error source " + error.source);
                    console.log("upload error target " + error.target);
                }, options);

            } else {
                $http({
                    method: 'POST',
                    url: url_base + 'post_add_group_post.php',
                    data: {
                        'id': $scope.session.id,
                        'group_id': Session.friend.id,
                        'hi5_check': $scope.msg.hi5_check,
                        'message': $scope.msg.message
                    },
                }).then(function successCallback(response) {
                    //console.log(response);
                    var alertPopup = $ionicPopup.alert({
                        title: 'Message Added!',
                        template: 'Successfully!'
                    });
                    alertPopup.then(function (res) {
                        $state.go('app.wall');
                        //$state.transitionTo('app.wall', {}, { reload: true, notify: true });
                    });
                }, function errorCallback(response) {

                });
            }
        }
    }
})

.controller('ConfigCtrl', function ($scope, $http, store, $state, $ionicPopup, Session) {
    var url_base = store.get('url_base');
    //$scope.session = store.get('session');
    $scope.session = Session.value;
})

.controller('CommentCtrl', function ($scope, $http, store, $state, $ionicPopup, Session, $stateParams) {
    var url_base = store.get('url_base');
    //$scope.session = store.get('session');
    $scope.session = Session.value;


    $scope.postid = $stateParams.postid;

    $scope.state = $state.current
    $scope.params = $stateParams;
    $scope.list = [];

    $http({
        method: 'GET',
        url: url_base + 'get_comments.php',
        params: {
            'post_id': $scope.postid
        },
    }).then(function successCallback(response) {
        if (response.data !== "null") {
            $scope.list = response.data;
        }
    }, function errorCallback(response) {

    });
    $scope.data = {
        comment: ""
    };

    $scope.saveComment = function () {
        $http({
            method: 'GET',
            url: url_base + 'post_add_comment.php',
            params: {
                'post_id': $scope.postid,
                'user_id': $scope.session.id,
                'message': $scope.data.comment
            },
        }).then(function successCallback(response) {
            //console.log(response);
            var alertPopup = $ionicPopup.alert({
                title: 'Comment Added!',
                template: 'Successfully!'
            });
            alertPopup.then(function (res) {
                $state.go('app.wall', {}, {});
                //$state.transitionTo('app.wall', {}, { reload: true, notify: true });
            });
        }, function errorCallback(response) {

        });
    }
})

.controller('AddGroupCtrl', function ($scope, $http, store, $state, $ionicPopup, Session) { //terminar
    var url_base = store.get('url_base');
    //$scope.session = store.get('session');
    $scope.session = Session.value;

    $scope.data = {
        name: "",
        description: "",
        picture: ""
    }

    $scope.showPreview = false;

    $scope.pictureSource = store.get('pictureSource');
    $scope.destinationType = store.get('destinationType');

    $scope.getPhoto = function () {
        navigator.camera.getPicture(function (imageURI) {
            // Show the selected image
            $scope.data.picture = imageURI;
            $scope.showPreview = true;
            $scope.$apply();

        }, function (message) {
            console.log('Failed because: ' + message);
        }, {
            quality: 50,
            destinationType: $scope.destinationType.FILE_URI,
            sourceType: $scope.pictureSource.PHOTOLIBRARY
        });
    }

    $scope.addGroup = function () {
        if ($scope.data.picture) {
            //set upload options
            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = $scope.data.picture.substr($scope.data.picture.lastIndexOf('/') + 1);
            options.mimeType = "image/jpeg";

            options.httpMethod = "POST";
            options.headers = {
                Connection: "close"
            };

            options.params = {
                'user_id': $scope.session.id,
                'name': $scope.data.name,
                'description': $scope.data.description
            }

            var ft = new FileTransfer();

            ft.upload($scope.data.picture, url_base + 'post_add_group_with_image.php', function (r) {
                console.log("Code = " + r.responseCode);
                console.log("Response = " + r.response);
                console.log("Sent = " + r.bytesSent);

                var alertPopup = $ionicPopup.alert({
                    title: 'Group Created!',
                    template: 'Successfully!'
                });
                alertPopup.then(function (res) {
                    $state.go('app.groups', {}, {});
                    //$state.transitionTo('app.groups', {}, { reload: true, notify: true });
                });
            }, function (error) {
                alert("An error has occurred: Code = " + error.code);
                console.log("upload error source " + error.source);
                console.log("upload error target " + error.target);
            }, options);
        } else {
            $http({
                method: 'POST',
                url: url_base + 'post_add_group.php',
                data: {
                    'user_id': $scope.session.id,
                    'name': $scope.data.name,
                    'description': $scope.data.description
                },
            }).then(function successCallback(response) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Group Created!',
                    template: 'Successfully!'
                });
                alertPopup.then(function (res) {
                    //$state.go('app.wall', {}, { reload: true });
                    $state.transitionTo('app.groups', {}, { reload: true, notify: true });
                });
            }, function errorCallback(response) {

            });
        }
    }
    

})

.controller('GroupWallCtrl', function ($scope, auth, store, $state, $http, Session, $stateParams) {

    var url_base = store.get('url_base');
    var session = store.get('session');
    //$scope.session = store.get('session');
    $scope.session = Session.value;
    $scope.groupid = $stateParams.groupid;

    $scope.list = [];
    //console.log($scope.groupid);
    $http({
        method: 'GET',
        url: url_base + 'get_group_posts.php',
        params: {
            'group_id': $scope.groupid
        },
    }).then(function successCallback(response) {
        if (response.data !== "null") {
            $scope.list = response.data;
        }
    }, function errorCallback(response) {

    });

    $scope.toggleLike = function (row) {
        $http({
            method: 'GET',
            url: url_base + 'get_like_user.php',
            params: {
                'user_id': session.id,
                'post_id': row.id
            },
        }).then(function successCallback(response) {
            if (response.data === "null") {
                $http({
                    method: 'POST',
                    url: url_base + 'post_add_like.php',
                    data: {
                        'user_id': session.id,
                        'post_id': row.id
                    },
                }).then(function successCallback(response) {
                    row.likes = parseInt(row.likes) + 1;
                }, function errorCallback(response) {

                });
            } else {
                $http({
                    method: 'POST',
                    url: url_base + 'put_toggle_like.php',
                    data: {
                        'user_id': session.id,
                        'post_id': row.id
                    },
                }).then(function successCallback(response) {
                    if (response.data !== "-")
                        row.likes = parseInt(row.likes) + 1;
                    else
                        row.likes = parseInt(row.likes) - 1;
                }, function errorCallback(response) {

                });
            }
        }, function errorCallback(response) {

        });
    }
})

.controller('UserWallCtrl', function ($scope, auth, store, $state, $http, Session, $stateParams) {

    var url_base = store.get('url_base');
    var session = store.get('session');
    //$scope.session = store.get('session');
    $scope.session = Session.value;
    $scope.user = Session.friend;
    console.log($scope.user);
    $scope.list = [];
    //console.log($scope.groupid);
    $http({
        method: 'GET',
        url: url_base + 'get_user_posts.php',
        params: {
            'user_id': $scope.user.id
        },
    }).then(function successCallback(response) {
        
        if (response.data !== "null") {
            $scope.list = response.data;
        }
    }, function errorCallback(response) {

    });

    $scope.toggleLike = function (row) {
        $http({
            method: 'GET',
            url: url_base + 'get_like_user.php',
            params: {
                'user_id': session.id,
                'post_id': row.id
            },
        }).then(function successCallback(response) {
            if (response.data === "null") {
                $http({
                    method: 'POST',
                    url: url_base + 'post_add_like.php',
                    data: {
                        'user_id': session.id,
                        'post_id': row.id
                    },
                }).then(function successCallback(response) {
                    row.likes = parseInt(row.likes) + 1;
                }, function errorCallback(response) {

                });
            } else {
                $http({
                    method: 'POST',
                    url: url_base + 'put_toggle_like.php',
                    data: {
                        'user_id': session.id,
                        'post_id': row.id
                    },
                }).then(function successCallback(response) {
                    if (response.data !== "-")
                        row.likes = parseInt(row.likes) + 1;
                    else
                        row.likes = parseInt(row.likes) - 1;
                }, function errorCallback(response) {

                });
            }
        }, function errorCallback(response) {

        });
    }
})

.controller('DetailGroupCtrl', function ($scope, $http, store, $state, $ionicPopup, Session, $stateParams) {//terminar
    var url_base = store.get('url_base');
    //$scope.session = store.get('session');
    $scope.session = Session.value;
    $scope.groupid = $stateParams.groupid;

    $scope.data = {};
    $scope.admin = {};
    $scope.list = [];

    $http({
        method: 'GET',
        url: url_base + 'get_group_detail.php',
        params: {
            'id': $scope.groupid
        },
    }).then(function successCallback(response) {
        //console.log(response.data);
        $scope.data = response.data;
    }, function errorCallback(response) {

    });

    $http({
        method: 'GET',
        url: url_base + 'get_group_friends.php',
        params: {
            'id': $scope.groupid
        },
    }).then(function successCallback(response) {
        //console.log(response.data);
        $scope.list = response.data;
    }, function errorCallback(response) {

    });

    $http({
        method: 'GET',
        url: url_base + 'get_group_admin.php',
        params: {
            'id': $scope.groupid
        },
    }).then(function successCallback(response) {
        $scope.admin = response.data;
    }, function errorCallback(response) {

    });

})

.controller('AddFriendGroupCtrl', function ($scope, $http, store, $state, $ionicPopup, Session, $stateParams) {//terminar
    var url_base = store.get('url_base');
    //$scope.session = store.get('session');
    $scope.session = Session.value;

    $scope.groupid = $stateParams.groupid;
    $scope.state = $state.current
    $scope.params = $stateParams;

    $scope.data = {
        search: ""
    }

    $http({
        method: 'GET',
        url: url_base + 'get_friends_no_group.php',
        params: {
            'user_id': $scope.session.id,
            'group_id': $scope.groupid
        },
    }).then(function successCallback(response) {
        $scope.list = response.data;
    }, function errorCallback(response) {
        //console.log(response);
    });

    $scope.get_users = function () {
        //$scope.data.search
    }

    $scope.add_friend = function (row) {
        $http({
            method: 'GET',
            url: url_base + 'post_add_friends_no_group.php',
            params: {
                'group_id': $scope.groupid,
                'friend_id': row.id
            },
        }).then(function successCallback(response) {
            //console.log(response);
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

});