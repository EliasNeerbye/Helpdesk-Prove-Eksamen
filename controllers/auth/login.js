const User = require('../../models/User');
const argon2 = require('argon2');

module.exports = async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({message: 'Email and password are required'});
    }

    let user;

    try {
        user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({message: 'Invalid email or password'});
        }
    } catch (error) {
        console.error("Error finding user by email.\n\n", error);
        return res.status(500).json({message: 'Internal server error'});
    }

    try {
        const isPasswordValid = await argon2.verify(user.password, password);
        if (!isPasswordValid) {
            return res.status(400).json({message: 'Invalid email or password'});
        }
    } catch (error) {
        console.error("Error verifying password.\n\n", error);
        return res.status(500).json({message: 'Internal server error'});
    }

    req.session.userId = user._id;
    return res.status(200).json({message: 'Login successful'});
}