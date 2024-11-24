const express = require('express');

let reactController = require('../../handlers/controllers/reactController');
let { generateRoomController,
    joinRoomController,
    exitRoomController,
    fetchRoomController,
     } = require('../../handlers/controllers/roomController');

module.exports = function (app) {
    const router = express.Router();

    router.post('/create-room', generateRoomController);

    router.post('/join-room', joinRoomController);

    router.get('/exit-room', exitRoomController);

    router.get('/fetch-room', fetchRoomController);

    app.use(router);
}