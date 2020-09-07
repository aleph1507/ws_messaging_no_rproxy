const moment = require("moment");

class Message {

    constructor(user, text, time = moment().format("h:mm a")) {
        this.user = user;
        this.message = text;
        this.time = time;
    }

}

module.exports = Message;