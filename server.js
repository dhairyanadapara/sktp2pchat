//require our websocket library
const fs = require('fs');
const express = require('express');
const https = require('https');
const WebSocket = require('ws');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const util = require('util');
const hbs = require('hbs');
const methodOverride = require('method-override');
const path = require('path');


const app = express();
let privateKey = fs.readFileSync('./config/key.pem');
let certificate = fs.readFileSync('./config/cert.pem');

let credentials = {
    key: privateKey,
    cert: certificate
}

let secret = require('./config/secret');
let User = require('./models/user');
let VChat = require('./models/chat');
const server = https.createServer(credentials, app);
const wss = new WebSocket.Server({server});


mongoose.connect(secret.database, (err) => {
    if (err)
        console.log(err);
    else
        console.log('database is connected');
});

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use((cookieParser()));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: secret.secret,
    store: new MongoStore({url: secret.database, autoReconnect: true})
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
});
//app.use(methodOverride('_method'));

// app.engine('ejs', ejsMate);
// app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

let data,conn,username;
let mainRoutes = require('./routes/main');
let userRoutes = require('./routes/user');
let videoRoutes = require('./routes/video');

app.use(mainRoutes);
app.use(userRoutes);
app.use(videoRoutes);

let users =new Array();                                             //all connected to the server users

//when a user connects to our sever
wss.on('connection', function (connection) {

    console.log("User connected");

    //when server gets a message from a connected user
    connection.on('message', function (message) {

        //accepting only JSON messages
        try {
            data = JSON.parse(message);
        } catch (e) {
            console.log("Invalid JSON");
            data = {};
        }

        //switching type of the user message
        switch (data.type) {
            //when a user tries to login
            case "login":
                console.log("User logged", data.name);
                users.push(data.name);
                //if anyone is logged in with this username then refuse
                if (users[data.name]) {
                    sendTo(connection, {
                        type: "login",
                        success: true,
                        users:users
                    });
                } else {
                    //save user connection on the server
                    users[data.name] = connection;
                    connection.name = data.name;

                    sendTo(connection, {
                        type: "login",
                        success: true,
                        users:users
                    });
                }

                break;

            case "offer":
                //for ex. UserA wants to call UserB
                console.log("Sending offer to: ", data.name);

                //if UserB exists then send him offer details
                conn = users[data.name];

                if (conn != null) {
                    //setting that UserA connected with UserB
                    connection.otherName = data.name;

                    sendTo(conn, {
                        type: "offer",
                        offer: data.offer,
                        name: connection.name
                    });
                }

                break;

            case "answer":
                console.log("Sending answer to: ", data.name);
                username = data.name;
                //for ex. UserB answers UserA
                conn = users[data.name];

                if (conn != null) {
                    connection.otherName = data.name;
                    sendTo(conn, {
                        type: "answer",
                        answer: data.answer
                    });
                }

                break;

            case "candidate":
                console.log("Sending candidate to:", data.name);
                conn = users[data.name];

                if (conn != null) {
                    sendTo(conn, {
                        type: "candidate",
                        candidate: data.candidate
                    });
                }

                break;

            case "leave":
                console.log("Disconnecting from", data.name);
                conn = users[data.name];
                conn.otherName = null;
                users.pop(data.name);
                //notify the other user so he can disconnect his peer connection
                if (conn != null) {
                    sendTo(conn, {
                        type: "leave",
                        name:data.name
                    });
                }

                break;

            default:
                sendTo(connection, {
                    type: "error",
                    message: "Command not found: " + data.type
                });

                break;
        }

    });

    //when user exits, for example closes a browser window
    //this may help if we are still in "offer","answer" or "candidate" state
    connection.on("close", function () {

        if (connection.name != null) {
            delete users[connection.name];

            if (connection.otherName != null) {
                console.log("Disconnecting from ", connection.otherName);
                let conn = users[connection.otherName];
                conn.otherName = null;

                if (conn != null) {
                    sendTo(conn, {
                        type: "leave",
                        name:data.name
                    });
                }
            }
        }

    });

    connection.on('error', () => console.log('errored'));

    //connection.send("Hello world");
});


function sendTo(connection, message) {
    connection.send(JSON.stringify(message));
}

server.listen(secret.port, '192.168.0.105' ,() => {
    console.log(`Server is UP`);
});