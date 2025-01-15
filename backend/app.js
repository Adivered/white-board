/* Env config and Env Initialiser */
let argv = require('minimist')(process.argv.slice(2));

let { initEnv, makeid } = require('./config/config');
const env = initEnv(argv.env);

/* dependencies */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

/*  Database handlers */
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

/* body parser */
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

/* Store */
const clientP = mongoose.connect(
    process.env.MONGODB_URI
  ).then(m => m.connection.getClient());


/* Session */
app.set('trust proxy', 1);
sessionMiddleware = session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        // clientPromise: clientP,
        mongoUrl: process.env.MONGODB_URI,
        collectionName: "sessions",
        autoRemove: 'interval',
        autoRemoveInterval: 30,
    }),
    cookie: {
        secure: env === "production", // Secure only in production
        sameSite: env === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 //Equals 24 hours
    }
});

app.use(sessionMiddleware);

/* Env Controller */
let controlEnv = require('./handlers/middlewares/controllEnv');
controlEnv(app, env, __dirname);


/* view engine */
// app.set('views', __dirname + '/views');
// app.set('view engine', 'ejs');

/* Services */
let { Service, serviceInit, addService } = require('./services/initService');
let service = (argv.service == null) ? Service.All() : argv.service.split(',');
serviceInit(app, service);

app.set('port', (process.env.PORT || 5000))

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});


/* Socket handlers */
const { createServer } = require("node:http");
const { Server } = require('socket.io');
const httpServer = createServer(app);
const io = new Server(httpServer, {
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
    },
    cors: {
        origin: [
            // `http://${process.env.PUBLIC_IP}:${process.env.FRONTEND_PORT}`,
            // `http://${process.env.PUBLIC_IP}:${process.env.PORT}`,
            // 'http://localhost:3000', 
            // 'http://127.0.0.1:3000', 
            'https://white-board-29h1.onrender.com/',
        ],
        methods: ["GET", "POST"],
        credentials: true,
    },
});
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));
const setupSocket = require('./handlers/middlewares/setupSocket');
setupSocket(io);


httpServer.listen(app.get('port'), process.env.IP, function () {
    console.log(`Server started at ${process.env.IP}:${app.get('port')}`);
    console.log(`env: ${process.env.NODE_ENV}`);
});