angular.module('starter.services', [])

.factory('Session', function () {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var data = {
        id: null,
        name: '',
        email: '',
        picture: '',
        gender: '',
        birthday: ''
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
        data['gender'] = '';
        data['birthday'] = '';
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

    function getID() {
        return data.id;
    }

    return {
        set: set,
        value: data,
        getID: getID,
        clear: clear,
        friend: friend,
        select_friend: selectFriend,
        clear_friend: clearFriend
    };

});
