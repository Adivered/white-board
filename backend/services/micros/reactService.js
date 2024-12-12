const express = require('express');
const path = require('path');

let { reactController } = require('../../handlers/controllers/reactController');

module.exports = function (app) {
    const router = express.Router();
    router.get('/', reactController);
    app.use(router);
}