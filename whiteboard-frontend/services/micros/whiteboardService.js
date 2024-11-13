const express = require('express');

let reactController = require('../../handlers/controllers/reactController');
let { createWhiteboard,
    updateWhiteboard,
    clearWhiteboard} = require('../../handlers/controllers/whiteboardController');

module.exports = function (app) {
    const router = express.Router();

    router.post('/update-whiteboard', updateWhiteboard);
    router.get('/clear-whiteboard', clearWhiteboard);
    app.use(router);
}