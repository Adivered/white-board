let express = require('express');
let path = require('path');
let cors = require('cors');

module.exports = (app, env, _dir = __dirname) => {
    if (env == "production") {
        //react-path
        app.set('trust proxy', true)
        app.use(cors({ 
            origin: "https://mern-whiteboard.netlify.app", 
            credentials: true,

    }));
        app.use(express.static(path.join(_dir, '/build')));
    } else if (env == "development") {
        app.use(cors({ origin: true }));
        app.use(express.static(path.join(_dir, '/public')));
    }else{
        //test maybe or something else
    }
}