import userModel from "../models/user.js";
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import GoogleStrategy from "passport-google-oauth20";
import passport from "passport";
import User from "../models/user.js";

dotenv.config();



passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
      // Генеруємо рандомний пароль
      const randomPassword = Math.random().toString(36).slice(-8);
  
      // Хешуємо пароль
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(randomPassword, salt);
  
      // Створюємо новий користувач
      const newUser = new User({
        username: profile.displayName, // або profile.emails[0].value, залежно від наявності
        email: profile.emails[0].value, // беремо першу доступну електронну адресу
        passwordHash: passwordHash
      });
  
      // Зберігаємо користувача в базі даних
      const savedUser = await newUser.save();
  
      // Повертаємо користувача для подальшого використання (якщо потрібно)
      cb(null, savedUser);
    } catch (error) {
      cb(error, null);
    }
  }
  ));

passport.serializeUser((user,done)=>{
    done(null,user)
})

passport.deserializeUser((user,done)=>{
    done(null,user)
})

export const googleCallback = (req,res)=>{
    try {
        const token = jwt.sign(
            {
                _id: req.user._id
            },
            'secret123',
            {
                expiresIn: '30d'
            }
        )
    
        const { passwordHash, ...userData } = req.user._doc
        res.cookie('token', token, { httpOnly: true });
        res.send({
            ...userData,
            token
        })
        
    } catch (error) {
        
    }
}

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

        const isValidPassword = bcrypt.compare(password, user._doc.passwordHash)


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

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)


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
        res.cookie('token', token, { httpOnly: true });
        res.json({
            ...userData,
        })
    } catch (error) {
        res.status(500).json({
            message: 'Не вдалось зареєструватись',
            error
        })
    }
}