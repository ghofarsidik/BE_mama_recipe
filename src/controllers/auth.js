const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcryptjs')
const createHttpError = require('http-errors');
const { response } = require('../herlpers/common');
const { generateToken, gerateRefreshToken } = require('../herlpers/auth');

const prisma = new PrismaClient()
const login = async(req, res, next)=>{
    try {
        const {email, password} = req.body
        const user = await prisma.user.findFirst({
            where: {
                email
            }
        })
        if(!user){
            next(createHttpError(403, 'Email or Password is incorrect'))
        }
        const validPassword = bcrypt.compareSync(password, user.password)
        if(!validPassword){
            next(createHttpError(403, 'Email or Password is incorrect'))
        }
        delete user.password
        const payload = {
            email: user.email,
            name: user.name
        }
        user.token = generateToken(payload);
        user.refreshToken = gerateRefreshToken(payload);
        response(res, user, 201, 'User success Login')

    } catch (error) {
        console.log(error);
        next(new createHttpError.InternalServerError())
    }
   
}

const register = async(req, res, next)=>{
    try {
        const {email, password, name, phone } = req.body
        const user = await prisma.user.findFirst({
            where: {
                email
            }
        })
        if(user){
            console.log(user);
            return next(createHttpError(403, "The user is already registered "))
        }
        const salt = bcrypt.genSaltSync(10);
        const passwrodHash = bcrypt.hashSync(password, salt);
        const result = await prisma.user.create({
            data:{
                email,
                password: passwrodHash,
                name,
                phone
            }
        })
        response(res, result, 201, 'User Success Register')
    } catch (error) {
        console.log(error);
        next(new createHttpError.InternalServerError())
    }
}

module.exports = {
    register,
    login
}