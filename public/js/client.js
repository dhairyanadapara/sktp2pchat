//our username
let name;
let connectedUser;

//connecting to our signaling server
let conn = new WebSocket('wss://192.168.0.105');

//user connected by req, res to server
conn.onopen = function () {
    console.log("Connected to the signaling server");
};

//when we got a message from a signaling server
conn.onmessage = function (msg) {
    console.log("Got message", msg.data);

    let data = JSON.parse(msg.data);                                     //take data field of message from json

    switch (data.type) {                                                  //checks ths data type
        case "login":
            handleLogin(data.success);
            handleContacts(data.users);                 //checks the login info
            break;
        // case "contacts":
        //     handleContacts(data.users);
        //     break;
        //when somebody wants to call us
        case "offer":
            handleOffer(data.offer, data.name);                         //make offer to other user
            break;
        case "answer":
            handleAnswer(data.answer);                                  //offer replied with this method
            break;
        //when a remote peer sends an ice candidate to us
        case "candidate":
            handleCandidate(data.candidate);
            break;
        case "leave":
            handleLeave(data.name);                                              //hangup call
            break;
        default:
            break;
    }
};

conn.onerror = function (err) {
    console.log("Got error", err);
};

//alias for sending JSON encoded messages
function send(message) {
    //attach the other peer username to our messages
    if (connectedUser) {
        message.name = connectedUser;
    }
    conn.send(JSON.stringify(message));                             //sends the message to server
};

//******
//UI selectors block
//******


let startBtn = document.querySelector('#startBtn');
let callToUsernameInput = document.querySelector('#callToUsernameInput');
let callBtn = document.querySelector('#callBtn');

let hangUpBtn = document.querySelector('#hangUpBtn');

let localVideo = document.querySelector('#localVideo');
let remoteVideo = document.querySelector('#remoteVideo');

let yourConn;
let stream;

// Login when the user clicks the button
startBtn.addEventListener("click", function (event) {

    name = document.getElementById("name").innerHTML;

    if (name.length > 0) {
        send({
            type: "login",
            name: name
        });
    }
});

function handleLogin() {

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    navigator.getUserMedia({video: true, audio: false}, function (myStream) {
        stream = myStream;

        //displaying local video stream on the page
        try {
            localVideo.srcObject = stream;
        }
        catch (e) {
            localVideo.src = window.URL.createObjectURL(stream);
        }

        //using Google public stun server
        let configuration = {
            "iceServers": [{"url": "stun:stun2.1.google.com:19302"}]
        };

        yourConn = new RTCPeerConnection(configuration);

        // setup stream listening
        yourConn.addStream(stream);

        //when a remote user adds stream to the peer connection, we display it
        yourConn.onaddstream = function (e) {
            remoteVideo.src = window.URL.createObjectURL(e.stream);
        };

        // Setup ice handling
        yourConn.onicecandidate = function (event) {
            if (event.candidate) {
                send({
                    type: "candidate",
                    candidate: event.candidate
                });
            }
        };
    }, function (error) {
        console.log(error);
    });
};

//initiating a call
callBtn.addEventListener("click", function () {
    let callToUsername = callToUsernameInput.value;

    if (callToUsername.length > 0) {

        connectedUser = callToUsername;

        // create an offer
        yourConn.createOffer(function (offer) {
            send({
                type: "offer",
                offer: offer
            });

            yourConn.setLocalDescription(offer);
        }, function (error) {
            alert("Error when creating an offer");
        });

    }
});

function handleContacts(users) {
    let user = users;

    document.getElementById("contacts").innerText = user;
}


//when somebody sends us an offer
function handleOffer(offer, name) {
    connectedUser = name;
    yourConn.setRemoteDescription(new RTCSessionDescription(offer));

    //create an answer to an offer
    yourConn.createAnswer(function (answer) {
        yourConn.setLocalDescription(answer);

        send({
            type: "answer",
            answer: answer
        });

    }, function (error) {
        alert("Error when creating an answer");
    });
};

//when we got an answer from a remote user
function handleAnswer(answer) {
    yourConn.setRemoteDescription(new RTCSessionDescription(answer));
};

//when we got an ice candidate from a remote user
function handleCandidate(candidate) {
    yourConn.addIceCandidate(new RTCIceCandidate(candidate));
};

//hang up
hangUpBtn.addEventListener("click", function () {

    send({
        type: "leave",
        name:name
    });
    handleLeave();
});

function handleLeave() {
    connectedUser = null;
    remoteVideo.src = null;

    yourConn.close();
    yourConn.onicecandidate = null;
    yourConn.onaddstream = null;
};


