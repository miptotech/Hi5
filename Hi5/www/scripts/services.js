angular.module('starter.services', [])

.factory('Session', function () {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var data = {
        id: null,
        name: '',
        email: '',
        picture: ''
    };

    var friend = {
        id: null,
        name: '',
        picture: ''
    }

    function set(value, field) {
        data[field] = value;
    }

    function clear() {
        data['id'] = null;
        data['name'] = '';
        data['email'] = '';
        data['picture'] = '';
    }

    function selectFriend(value, field) {
        friend[field] = value;
    }

    function clearFriend() {
        friend['id'] = null;
        friend['name'] = '';
        friend['email'] = '';
        friend['picture'] = '';
    }

    return {
        set: set,
        value: data,
        clear: clear,
        friend: friend,
        select_friend: selectFriend,
        clear_friend: clearFriend
    };

});
