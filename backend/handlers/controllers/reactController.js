const path = require('path');

const reactController = async (req, res, next) => {
    res.locals.someData = 'Some shared data';
    next(); // Pass control to the next handler
};

const getSessionData = async (req, res) => {
    console.log("Session Data: ", req.session);
    try {
        const sessionData = req.session;
        res.status(200).json({ success: true, session: sessionData });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { reactController, getSessionData };