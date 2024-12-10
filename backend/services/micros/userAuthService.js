const express = require('express');
const path = require('path');

let reactController = require('../../handlers/controllers/reactController');
let { registerController, loginController, logoutController, getUserByTokenController } = require('../../handlers/controllers/authUserController');
let { auth } = require('../../handlers/middlewares/auth');

module.exports = function (app) {
    const router = express.Router();

    router.post('/register', registerController);

    router.post('/login', loginController);

    router.get('/logout', auth, logoutController);

    router.get('/token', auth, getUserByTokenController);

    app.use(router);
}