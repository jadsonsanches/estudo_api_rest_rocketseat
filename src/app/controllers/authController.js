const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authConfig = require('../../config/auth');

const router = express.Router();

function generateToken(params = {}) {
    //  secret: apirest
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400
    })
}

router.post('/register', async (req, res) => {
    const { email } = req.body;

    try {
        if (await User.findOne({ email }))
            return res.status(400).send({ error: 'Usuário já existe' });

        const user = await User.create(req.body);

        user.password = undefined;
        return res.send({
            user,
            token: generateToken({ id: user.id })
        });
    } catch (err) {
        return res.status(400).send({ error: 'Falha ao cadastrar' });
    }
});

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');

        if (!user)
            return res.status(400).send({ error: 'Usuário não encontrado' });

        if(!await bcryptjs.compare(password, user.password))
            return res.status(400).send({ error: 'Senha inválida' });

        user.password = undefined;  
        const token = generateToken({ id: user.id });
        
        return res.send({ user, token });    
    } catch (error) {
        return res.status(400).send({ error: 'Falha ao autenticar' });
    }
});

module.exports = (app) => app.use('/auth', router);