import express from "express";
import mongoose from "mongoose";

import { registerValidator } from "./validations/auth.js";
import checkAuth from "./utils/checkAuth.js";
import { getMe, login, register } from "./conrollers/userController.js";
import { createPost, deletePost, getPostOne, getPostsAll, updatePost } from "./conrollers/postController.js";
import { postValidator } from "./validations/postValidation.js";

mongoose
  .connect('mongodb://localhost:27017/Blogbox')
  .then(() => console.log('Успішне підключення до бази даних'))
  .catch((error) => console.log(error))

const app = express();

app.use(express.json())



app.get('/posts', getPostsAll)
app.get('/posts/:id', getPostOne)
app.post('/posts', postValidator , checkAuth, createPost)
app.delete('/posts/:id', checkAuth, deletePost)
app.patch('/posts/:id', checkAuth, updatePost)


app.get('/auth/me', checkAuth, getMe)

app.post('/auth/login', login)

app.post('/auth/register', registerValidator, register)

app.listen(3000)