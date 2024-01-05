

import { validationResult } from "express-validator"
import Post from "../models/post.js"



export const createPost = async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()[0].msg
        })
    }
    try {
        const { title, text, tags, viewsCount, image } = req.body

        const doc = new Post({
            title,
            text,
            tags,
            user: req.userId,
            viewsCount,
            image
        })

        const post = await doc.save()


        res.json({
            ...post._doc
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Не вдалось створити пост',
        })
    }
}

export const getPostsAll = async (req, res) => {
    try {
        const sortBy = req.query.sort;

        let posts;

        if (sortBy === 'views') {
            posts = await Post.find().populate({
                path: 'user',
                model: 'User',
                select: '-passwordHash'
            }).populate({
                path: 'comments',
                model: 'Comment',
                populate: {
                    path: 'user',
                    model: 'User',
                    select: '-passwordHash'
                }
            }).exec();
        } else {
            posts = await Post.find().populate({
                path: 'user',
                model: 'User',
                select: '-passwordHash'
            }).populate({
                path: 'comments',
                model: 'Comment',
                populate: {
                    path: 'user',
                    model: 'User',
                    select: '-passwordHash'
                }
            }).exec();
        }
        
        
        
        

        res.json(posts);

    } catch (error) {
        res.status(401).json({ message: "Немає доступа" });
    }
};


export const getPostOne = async (req, res) => {
    try {
        const postId = req.params.id;

        const post = await Post.findByIdAndUpdate(
            {_id:postId}, // Передавайте ідентифікатор як рядок або ObjectId, але не обгортати його в об'єкт
            { $inc: { viewsCount: 1 } },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: "Стаття не знайдена" });
        }

        return res.json(post);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Не вдалось повернути статтю" });
    }
};

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.userId;


        const post = await Post.findOne(
            {_id:postId}, // Передавайте ідентифікатор як рядок або ObjectId, але не обгортати його в об'єкт
        );
        

        if (!post) {
            return res.status(404).json({ message: "Стаття не знайдена" });
        }

        if (!post || userId !== post.user.toString()) {
            return res.status(403).json({
                message: 'Ви не маєте прав для видалення цього поста',
            });
        }

        return res.json({
            succes: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Не вдалось видалити статтю" });
    }
}

export const updatePost = async (req, res) => {
    try {
        const { title, text, tags, viewsCount, image } = req.body;
        const postId = req.params.id;
        const userId = req.userId; // Припустимо, що ви отримуєте ідентифікатор користувача з токену аутентифікації

        // Знайдіть пост за його id
        const post = await Post.findById(postId);

        // Перевірте, чи користувач є власником поста
        if (!post || userId !== post.user.toString()) {
            return res.status(403).json({
                message: 'Ви не маєте прав для оновлення цього поста',
            });
        }

        // Оновіть пост
        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { title, text, tags, viewsCount, image },
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).json({ message: "Стаття не знайдена" });
        }

        return res.json(updatedPost);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Не вдалось оновити статтю" });
    }
};


