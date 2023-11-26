const { ResponseTemplate } = require('../helper/template.helper')
const { HashPassword, ComparePassword } = require('../helper/hash_pass_helper')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
var jwt = require('jsonwebtoken')

async function Create(req, res) {

    const { name, phone_number, email, password, role } = req.body

    const hashPass = await HashPassword(password)

    const payload = {
        name,
        phone_number,
        email,
        password: hashPass,
        role
    }

    console.log(payload)

    const emailUser = await prisma.user.findUnique({
        where: {email: payload.email},
    });

    if (emailUser) {
        let resp = ResponseTemplate(null, 'Email already exist', null, 404)
        res.status(404).json(resp)
        return
    }

    try {
        
        await prisma.user.create({
            data: payload
        });

        const userView = await prisma.user.findUnique({
            where: {
                email: payload.email
            },
            select: {
                name: true,
                email: true,
                phone_number: true,
                role: true
            },
        });

        let resp = ResponseTemplate(userView, 'success', null, 200)
        res.status(200).json(resp);
        return

    } catch (error) {
        let resp = ResponseTemplate(null, 'internal server error', error, 500)
        res.status(500).json(resp)
        return

    }
}

async function Login(req, res) {

    try {
        const { email, password } = req.body

        const checkUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (checkUser === null) {
            let resp = ResponseTemplate(null, 'email is not found or incorrect', null, 400)
            res.status(400).json(resp)
            return
        }

        const checkPassword = await ComparePassword(password, checkUser.password)

        if (!checkPassword) {
            let resp = ResponseTemplate(null, 'password is not correct', null, 400)
            res.status(400).json(resp)
            return
        }

        const token = jwt.sign({
            id: checkUser.id,
            email: checkUser.email,
            role: checkUser.role
        }, process.env.SECRET_KEY,
            {expiresIn: '24h'});

        let resp = ResponseTemplate(token, 'success', null, 200)
        res.status(200).json(resp)
        return

    } catch (error) {
        let resp = ResponseTemplate(null, 'internal server error', error, 500)
        res.status(500).json(resp)
        return
    }
}

async function LoginClient(req, res) {

    try {
        const { email } = req.body

        const checkUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (checkUser === null) {
            let resp = ResponseTemplate(null, 'email is not found or incorrect', null, 400)
            res.status(400).json(resp)
            return
        }

        const token = jwt.sign({
            clientId: checkUser.id,
            email: checkUser.email,
            role: checkUser.role
        }, process.env.SECRET_KEY,
            {expiresIn: '24h'});

        let resp = ResponseTemplate(token, 'success', null, 200)
        res.status(200).json(resp)
        return

    } catch (error) {
        let resp = ResponseTemplate(null, 'internal server error', error, 500)
        res.status(500).json(resp)
        return
    }
}

async function userStatus(req, res) {

    try {
        
        const users = await prisma.temp.findMany({
            where: {
                deletedAt: null
            },
            select: {
                id_user: true,
                status: true
            },
        });
        const cekUser = (objectName) => {
            return Object.keys(objectName).length === 0
        }
        
        if (cekUser(users) === true) {
            let resp = ResponseTemplate(null, 'tidak ada yang online', null, 404)
            res.json(resp)
            return
        }

        let resp = ResponseTemplate(users, 'success', null, 200)
        res.json(resp)
        return

    } catch (error) {
        let resp = ResponseTemplate(null, 'internal server error', error, 500)
        res.json(resp)
        return
    }
}

module.exports = {
    Create,
    Login,
    LoginClient,
    userStatus
}