const users = [];

class User {

    constructor(id = null, username = null, channel = null) {
        this._id = id;
        this._username = username;
        this._channel = channel;

        users.push(this);
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get username() {
        return this._username;
    }

    set username(value) {
        this._username = value;
    }

    get channel() {
        return this._channel;
    }

    set channel(value) {
        this._channel = value;
    }

    static getUser(id) {
        return users.find(user => user.id === id);
    }

    static userLeave(id) {
        const index = users.findIndex(user => user.id === id);

        if (index !== -1) {
            return users.splice(index, 1)[0];
        }
    }

    static getChannelUsers(channel) {
        return users.filter(user => user.channel === channel);
    }

    static getUsers() {
        return users;
    }
}

module.exports = User;