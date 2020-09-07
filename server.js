const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const User = require("./models/User");

const Message = require("./models/Message");

let socketsCheck = [];

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index");
});

io.on("connection", socket => {

    socket.on("getChannelUsers", ch => {
        console.log("ch", ch);
        console.log("getChannelUsers", User.getChannelUsers(ch));
        io.to(socket.id).emit(User.getChannelUsers(ch));
    });

    socket.on("joinChannel", ({username, channel}) => {

        const user = new User(socket.id, username, channel);

        socket.emit("message", new Message("Server", JSON.stringify({
            user_count: User.getUsers().length
        })));

        socket.join(user.channel);
        socket.emit("message", new Message("Server", JSON.stringify({
            username,
            channel
        })));

        io.to(socket.id).emit("message", `Welcome ${user.username} to ${user.channel}`);

        socket.on("message", msg => {
            console.log('users: ', User.getUsers().length);

            io.to(user.channel).emit("message", new Message(JSON.stringify(user), msg.message));

            io.to(socket.id).emit("message", new Message(JSON.stringify({
                confirmation: true,
                socket_id: socket.id,
                confirmationStamp: msg.stamp
            })));

        });

        socket.on("disconnect", () => {

            console.log("socket.on disconnect");
            io.to(socket.id).emit("message", "disconnecting");
            User.userLeave(socket.id);
            socket.emit("message", new Message("Server", `${user.username} disconnected`));

        });

    });

});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));