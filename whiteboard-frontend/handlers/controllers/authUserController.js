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
        res.status(200).json({ success: true, user: user.toJSON(), token });
    } catch (e) {
        console.error('Error during login:', e);
        res.status(400).json({ msg: 'Error during login', error: e.message });
    }
}

let getUserByTokenController = async (req, res) => {
    console.log('Get user by token request received');
    const token = req.header('Authorization').replace('Bearer ', '');
    console.log('Received token:', token);

    try {
        const user = await User.findByToken(token);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(200).json({ success: true, user: user.toJSON() });
    } catch (e) {
        console.error('Error during get user by token:', e);
        res.status(400).json({ msg: 'Error during get user by token', error: e.message });
    }
};


let logoutController = (req, res) => {
    User.removeToken(req.token).then(() => {
        // res.status(200).send();
        req.session.destroy();

        res.redirect('/login');
    }, () => {
        res.status(400).send({success: false, error: 'Bad Request'});                        
    });
}

module.exports = {registerController,loginController,logoutController, getUserByTokenController}