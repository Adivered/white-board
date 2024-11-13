/* Env config and Env Initialiser */
let argv = require('minimist')(process.argv.slice(2));
let { initEnv, makeid } = require('./config/config');
const cors = require('cors');
const env = initEnv(argv.env)
const express = require('express');
const app = express();
const MongoStore = require('connect-mongo');
const session = require('express-session');
const connection = require('./database/mongoose');

/*  Database handlers */

/* Socket handlers */
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://10.0.0.2:3000", // Adjust the URL to match your frontend's URL
    methods: ["GET", "POST"]
  }
});


app.use(express.json())
app.use(express.urlencoded({ extended: true }))



/* Session */
const sessionStore = MongoStore.create({
    client: connection.getClient(),
    collection: 'session'
})
//console.log(sessionStore);

app.use(session({
    secret: "pj",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 //Equals 24 hours
    }
}))


/* view engine */
// app.set('views', __dirname + '/views');
// app.set('view engine', 'ejs');

/* Env Controller */
let controlEnv = require('./handlers/middlewares/controllEnv');
controlEnv(app, env, __dirname);

/* Services */
let { Service, serviceInit, addService } = require('./services/initService');
let service = (argv.service == null) ? Service.All() : argv.service.split(',');
serviceInit(app, service);

app.set('port', (process.env.PORT || 5000))

app.get('*', (req, res) => {
    // res.sendFile(path.join(__dirname + '/client/public/index.html'));
    res.send('404')
});

/* SOCKET */
io.on('connection', (socket) => {
    console.log('a user connected');
  
    socket.on('drawing', (data) => {
      console.log('drawing event received:', data); // Log the drawing event
      socket.broadcast.emit('drawing', data);
    });
  
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });


server.listen(app.get('port'), process.env.IP, function () {
    console.log(`Server started at ${app.get('port')}`);
    console.log(`env: ${process.env.NODE_ENV}`);
});