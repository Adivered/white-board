/* Env config and Env Initialiser */
let argv = require('minimist')(process.argv.slice(2));
let { initEnv, makeid } = require('./config/config');

const env = initEnv(argv.env);
const express = require('express');
const app = express();
const MongoStore = require('connect-mongo');
const session = require('express-session');

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


/* Env Controller */
let controlEnv = require('./handlers/middlewares/controllEnv');
controlEnv(app, env, __dirname);
app.set('trust proxy', true)




/* Session */
/*  Database handlers */
const connection = require('./database/mongoose');
const sessionStore = MongoStore.create({
    client: connection.getClient(),
    collection: 'session'
})

const sessionMiddleware = session({
    name: "whiteboard.sid",
    secret: process.env.JWT_SECRET,
    resave: true,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        secure:true,
        httpOnly:true,
        sameSite:"none",
        maxAge: 1000 * 60 * 60 * 24 //Equals 24 hours
    }
});

app.use(sessionMiddleware);


/* view engine */
// app.set('views', __dirname + '/views');
// app.set('view engine', 'ejs');

/* Services */
let { Service, serviceInit, addService } = require('./services/initService');
let service = (argv.service == null) ? Service.All() : argv.service.split(',');
serviceInit(app, service);

app.set('port', (process.env.PORT || 5000))

app.get('*', (req, res) => {
    // res.sendFile(path.join(__dirname + '/client/public/index.html'));
    res.send('404')
});


/* Socket handlers */
const { createServer } = require("node:http");
const server = createServer(app);
const setupSocket = require('./handlers/middlewares/setupSocket'); // Import the new middleware
const io = setupSocket(server);
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

server.listen(app.get('port'), process.env.IP, function () {
    console.log(`Server started at ${app.get('port')}`);
    console.log(`env: ${process.env.NODE_ENV}`);
});