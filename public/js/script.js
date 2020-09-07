const socket = io({
    transports: ["websocket"],
    // forceNew: true
});
const joinForm = document.getElementById("join-form");
const usernameInput = document.getElementById("username");
const channelsInput = document.getElementById("channels");
const msgDiv = document.getElementById("msg-div");
const msgForm = document.getElementById("msg-form");
const msgInput = document.getElementById("msg");
const messages = document.getElementById("messages");
const getChannelUsers = document.getElementById("get-channel-users");
const results = document.getElementById("results");
const autoForm = document.getElementById("auto-form");
const nSockets = document.getElementById("nSockets");
const autoMsgForm = document.getElementById("auto-msg-form");
const nSeconds = document.getElementById("nSeconds");

let autoMsgInterval;

const autoSockets = [];

socket.on("reconnect_attempt", () => {
    socket.io.opts.transports = ["websocket"];
});

const stamps = {};

// const { username, room } = Qs.parse(location.search, {
//     ignoreQueryPrefix: true
// });

socket.on("message", messageHandler);

socket.on("getChannelUsers", (users) => {
    users = JSON.parse(users).toArray();
    results.innerText = users.join(",");
});


// getChannelUsers.addEventListener("click", () => {
//     console.log("getChannelUsers");
//     socket.emit("getChannelUsers", { ch: channelsInput.options[channelsInput.selectedIndex].value });
// })

joinForm.addEventListener("submit", (e) => {
    e.preventDefault();

    socket.emit("joinChannel", {
        username: usernameInput.value || "sample username",
        channel: channelsInput.options[channelsInput.selectedIndex].value || "sample room"
    });

    msgDiv.style.display = "block";
});

msgForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const message = {
        message: msgInput.value,
        stamp: Date.now()
    }

    stamps[message.message] = message.stamp;

    socket.emit("message", message);
});

autoForm.addEventListener("submit", (e) => {
    e.preventDefault();

    for (let i = 0; i < parseInt(nSockets.value); i++) {
        let newSocket = io();
        newSocket.emit("joinChannel", {
            username: "autoSocket" + i.toString(),
            channel: channelsInput.options[channelsInput.selectedIndex].value
        });

        newSocket.on("message", messageHandler);

        autoSockets.push(newSocket);
    }

    console.log("autoSockets: ", autoSockets);
});

autoMsgForm.addEventListener("submit", (e) => {
    e.preventDefault();

    console.log("autoMsgForm submit");

    if (autoSockets.length > 0) {
        autoMsgInterval = setInterval(() => {
            autoSockets.forEach(sock => {
                let remainingSocketsStamps = checkSocketConfirms(sock);
                if (remainingSocketsStamps && remainingSocketsStamps.length > 0) {
                    console.log("waiting for confirmation for messages from socket: ", sock);
                    console.log("stamps: ", remainingSocketsStamps);
                }
                sock.emit("message", {
                    message: "auto message",
                    stamp: Date.now()
                });
            });

        }, parseInt(nSeconds.value) * 1000)
    }
})

function messageHandler(message) {
    if (message.confirmation && stamps[message.message]
        && message.socket_id === socket.id) {

        console.log("Message confirmed: ", message);
        delete stamps[message.message];
    }
    outputMessage(message);
}

function checkSocketConfirms(socket) {
    // const socketStamps = JSON.parse(stamps).filter(stamp => stamp.socket === socket);
    console.log('stamps: ', stamps);
    // let socketStamps = stamps.filter(stamp => stamp.socket === socket);
    // const ul = document.createElement("ul");
    // socketStamps.forEach(stamp => {
    //     let li = document.createElement("li");
    //     li.innerHTML = stamp;
    //     ul.appendChild(li);
    // })
    // results.innerHTML = "";
    // results.appendChild(ul);
    // return socketStamps;
}


// output msg to dom
function outputMessage(message) {
    message = tryParse(message) || message;
    const div = document.createElement("div");
    div.classList.add("message");
    if (!message.user) {
        div.innerHTML = `<p>${message}</p>`;
        return messages.appendChild(div);
    }
    const user = tryParse(message.user);
    const name = user._username ?? message.user;

    div.innerHTML = `<p class="meta">${name} <span>${message.time}</span></p><p class="text">${message.message}</p>`;
    messages.appendChild(div);
}

function tryParse(maybeJson) {
    let json;
    try {
        json = JSON.parse(maybeJson);
    } catch (e) {
        return false;
    }

    return json;
}