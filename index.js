import express from "express";
import mongoose from "mongoose";

import { registerValidator } from "./validations/auth.js";
import checkAuth from "./utils/checkAuth.js";
import { getMe, login, register } from "./conrollers/userController.js";
import { createPost, deletePost, getPostOne, getPostsAll, updatePost } from "./conrollers/postController.js";
import { postValidator } from "./validations/postValidation.js";


import multer from "multer";
import validationError from "./utils/validationError.js";
import { createComment } from "./conrollers/commentController.js";

mongoose
  .connect('mongodb://localhost:27017/Blogbox')
  .then(() => console.log('Успішне підключення до бази даних'))
  .catch((error) => console.log(error))

const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads')
  },
  filename: (_,file, cb) => {
    cb(null, file.originalname)
  },
})

const upload = multer({storage})

app.use(express.json())

app.use('/uploads/', express.static('uploads'))

app.post('/upload', upload.single('image'), (req, res)=>{
  res.json({
    url: `/uploads/${req.file.originalname}`
  })
})



app.get('/posts', getPostsAll)
app.get('/posts/:id', getPostOne)
app.post('/posts', postValidator, validationError,  checkAuth, createPost)
app.delete('/posts/:id', checkAuth, deletePost)
app.patch('/posts/:id', checkAuth, postValidator, validationError, updatePost)

app.post('/comments',  checkAuth, createComment)


app.get('/auth/me', checkAuth, getMe)
app.post('/auth/login', login)
app.post('/auth/register', registerValidator, validationError, register)

app.listen(3000)