const User = require('../../models/User');
const argon2 = require('argon2');
const validator = require('validator');

module.exports = async (req, res) => {
    const { email, password, checkPassword } = req.body;

    if (!email || !password || !checkPassword) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
    
        if (!validator.isStrongPassword(password)) {
            return res.status(400).json({ message: 'Password is not strong enough' });
        }
    } catch (error) {
        console.error("Validation error.\n\n", error);
        return res.status(500).json({ message: 'Error validating input' });
    }

    try {
        const exists = await User.findOne({ email });

        if (exists) {
            return res.status(409).json({ message: 'User already exists' });
        }
    } catch (error) {
        console.error("Error looking for user by email.\n\n", error);
        return res.status(500).json({ message: 'Internal server error' });
    }

    let hashedPassword;

    try {
        if (password !== checkPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        hashedPassword = await argon2.hash(password);
    } catch (error) {
        console.error("Error hashing password.\n\n", error);
        return res.status(500).json({ message: 'Internal server error' });
    }

    try {
        const newUser = new User({
            email,
            password: hashedPassword,
        });
        await newUser.save();

        req.session.userId = newUser._id;

        return res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error("Error creating user.\n\n", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}