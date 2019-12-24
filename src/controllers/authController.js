const express = require('express');
const User = require('../models/user');
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        console.log("ENTROUUUU..");
        const user = await User.create(req.body);

        return res.send({ user });
    } catch (error) {
        return res.status(400).send({ error: 'Registration Failed' });
    }
});

module.exports = app => app.use('/auth', router);