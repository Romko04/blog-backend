import userModel from "../models/user.js";
import jwt from "jsonwebtoken";
import bccrypt from "bcrypt";


export const getMe = async (req, res) => {
    try {
        const userId = req.userId

        const user = await userModel.findById(userId)
        res.json(user)

    } catch (error) {
        res.status(401).json({ message: "Немає доступа" })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(404).json({
                message: 'Такого користувача не існує',
            })
        }

        const isValidPassword = bccrypt.compare(password, user._doc.passwordHash)


        if (!isValidPassword) {
            return res.status(404).json({
                message: 'Неправильний логін або пароль',
            })
        }

        const token = jwt.sign(
            {
                _id: user._id
            },
            'secret123',
            {
                expiresIn: '30d'
            }
        )

        const { passwordHash, ...userData } = user._doc

        res.json({
            ...userData,
            token
        })

    } catch (error) {
        res.status(500).json({
            message: 'Не вдалось авторизуватись',
        })
    }
}

export const register = async (req, res) => {
    
    try {
        const { username, email, password, userAvatar } = req.body

        const salt = await bccrypt.genSalt(10)
        const hash = await bccrypt.hash(password, salt)


        const doc = new userModel({
            username,
            email,
            passwordHash: hash,
            userAvatar
        })

        const user = await doc.save()


        const token = jwt.sign(
            {
                _id: user._id
            },
            'secret123',
            {
                expiresIn: '30d'
            }
        )

        const { passwordHash, ...userData } = user._doc

        res.json({
            ...userData,
            token
        })
    } catch (error) {
        res.status(500).json({
            message: 'Не вдалось зареєструватись',
            error
        })
    }
}