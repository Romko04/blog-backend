import express from "express";
import bccrypt from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import userModel from "./models/user.js";
import { registerValidator } from "./validations/auth.js";
import { validationResult } from "express-validator";

mongoose
  .connect('mongodb://localhost:27017/Blogbox')
  .then(() => console.log('Успішне підключення до бази даних'))
  .catch((error) => console.log(error))

const app = express();

app.use(express.json())

app.post('/auth/register', registerValidator, async function (req, res) {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg
    })
  }
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
})

app.listen(3000)