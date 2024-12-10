let express = require('express');
let path = require('path');
let cors = require('cors');

// CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests from your frontend origin
      const allowedOrigins = [
        // `http://${process.env.PUBLIC_IP}:${process.env.FRONTEND_PORT}`,
        // `http://${process.env.PUBLIC_IP}:${process.env.PORT}`,
        // 'http://localhost:3000', 
        // 'http://127.0.0.1:3000', 
        'https://mern-whiteboard.netlify.app',
      ];
      
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth"],
    credentials: true
  };

module.exports = (app, env, _dir = __dirname) => {
    if (env == "production") {
        //react-path
        app.set('trust proxy', true)
        app.use(cors({ 
            origin: "https://mern-whiteboard.netlify.app", 
            allowedHeaders: ["Content-Type", "Authorization", "x-auth"],
            methods: ["GET", "POST"],
            credentials: true,
    }));
        app.use(express.static(path.join(_dir, '/build')));
    } else if (env == "development") {
        console.log("Using dev cors")
        app.use(cors(corsOptions));
        app.use(express.static(path.join(_dir, '/public')));
    }else{
        //test maybe or something else
    }
}