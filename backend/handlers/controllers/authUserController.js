let {User} = require('../../database/models/user');

let registerController = async (req, res) => {
    console.log('Registration request received');
    const { name, email, password } = req.body;
    console.log('Received data:', { name, email, password });

    try {
        const existingUser = await User.accountExists(email);
        if (existingUser) {
            console.log('User already exists');
            return res.status(400).json({ msg: 'User already exists' });
        }

        const user = new User({ name, email, password });
        await user.save();
        
        const token = await user.generateAuthToken();

        req.session.xAuth = token;
        req.session.uid = user._id;
        req.session.name = user.name;
        res.setHeader('x-auth', token);
        await req.session.save();
        res.status(200).json({ msg: 'Registration successful' });
    } catch (e) {
        console.error('Error during registration:', e);
        res.status(400).json({ msg: 'Error during registration', error: e.message });
    }
}



let loginController = async (req, res) => {
    console.log('Login request received');
    const { email, password } = req.body;
    console.log('Received data:', { email, password });

    try {
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();
        req.session.xAuth = token;
        req.session.uid = user._id;
        req.session.email = user.email;
        req.session.name = user.name;
        res.setHeader('x-auth', token);

        await req.session.save();
        res.status(200).json({ success: true, session: req.session });
    } catch (e) {
        console.error('Error during login:', e);
        res.status(400).json({ msg: 'Error during login', error: e.message });
    }
}

let getUserByTokenController = async (req, res) => {
    let token = req.header('x-auth');
    console.log("Token: ", token);
    console.log("Session: ", req.session);
    console.log("Token: ", req.token);

    if (!token) {
        token = req.query.xAuth;
    }
    if (!token) {
        token = req.session.xAuth;
    }
    if (token) {
        console.log("Token: ", token);
        const user = await User.findByToken(token);
        res.status(200).json({ success: true, user: {name: user.name, uid: user._id} });
    }
    else {
        res.status(400).json({ msg: 'No token provided' });
    }
};


let logoutController = async (req, res) => {
    console.log("token: ", req.token);
    try{
        const user = await User.findOne(req.user._id);
        //console.log("User found: ", user);
        user.removeToken(req.token).then(() => {
            // res.status(200).send();
            //console.log("Request session: ", req.session);
            req.session.destroy();
            res.redirect('/login');
            console.log("User had been logout safely");
        }, () => {
            res.status(400).send({success: false, error: 'Bad Request'});                        
        });
    } catch (error){};

}
  
module.exports = {registerController,loginController,logoutController, getUserByTokenController}