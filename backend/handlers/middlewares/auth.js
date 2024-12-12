let { User } = require('../../database/models/user');

let auth = (req, res, next) => {
    let token = req.header('x-auth');
    if (!token)
        token = req.query.xAuth;
    
    if (!token)
        token = req.session.xAuth;
    
    User.findByToken(token).then((user) => {
        if (!user)
            return Promise.reject();
        
        req.user = user.toJSON();
        req.token = token;
        next();
    }).catch((e) => {
        if (req.method == 'GET') {
            res.redirect('/login');
        } else {
            res.status(401).send();
        };
    });
};

module.exports = { auth };
