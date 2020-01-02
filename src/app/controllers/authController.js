const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authConfig = require('../../config/auth');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');

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

        if (!await bcryptjs.compare(password, user.password))
            return res.status(400).send({ error: 'Senha inválida' });

        user.password = undefined;
        const token = generateToken({ id: user.id });

        return res.send({ user, token });
    } catch (err) {
        return res.status(400).send({ error: 'Falha ao autenticar' });
    }
});

router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).send({ error: 'Usuário não encontrado' });

        const token = crypto.randomBytes(20).toString('hex');

        //dateNow vai ser passado para passwordResetExpires, é a data e hora limite para fazer a alteração da senha
        const dateNow = new Date();
        dateNow.setHours(dateNow.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: dateNow,
            }
        });

        mailer.sendMail({
            to: email,
            from: 'jadson.sanches@gmail.com',
            subject: 'Esqueci minha senha',
            html: `<p>Você esqueceu sua senha? Não tem problema, utilize esse token: ${token}</p>`,
        }, (err) => {
            if(err)
                return res.status(400).send({ error: 'Não é possível enviar o email de esqueci minha senha' });
           
            return res.send();
        });
    } catch (err) {
        console.log(err);
        res.status(400).send({ error: 'Erro no esqueci minha senha, tente novamente' });
    }
});

module.exports = (app) => app.use('/auth', router);