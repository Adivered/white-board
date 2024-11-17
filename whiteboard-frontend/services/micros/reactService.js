const express = require('express');
const path = require('path');

let { reactController, getSessionData } = require('../../handlers/controllers/reactController');

module.exports = function (app) {
    const router = express.Router();

    // Use reactController as a middleware and then getSessionData
    router.get('/', reactController);
    router.get('/session', getSessionData);
    //   app.use('/swagger/api', express.static('./public/swagger.yaml'));
    //   app.use('/explorer', express.static('./public/swagger-ui'));
    app.use(router);
}