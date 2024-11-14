const express = require('express');

let reactController = require('../../handlers/controllers/reactController');
let { getWhiteboardByInstance,
    updateWhiteboard,
    clearWhiteboard} = require('../../handlers/controllers/whiteboardController');

module.exports = function (app) {
    const router = express.Router();
    router.post('/fetch-whiteboard', getWhiteboardByInstance )
    router.post('/update-whiteboard', updateWhiteboard);
    router.get('/clear-whiteboard', clearWhiteboard);
    app.use(router);
}