import Comment from "../models/comment.js"
import Post from "../models/post.js";

export const createComment = async (req, res) => {

    try {
       
    const userId = req.userId

    const { post, text } = req.body


    const newComment = new Comment({
        text,
        post,
        user:userId  // Переконайтеся, що це дійсний ID поста
    });

    const savedComment = await newComment.save()

    await Post.findByIdAndUpdate(
        post,
        { $push: { comments: newComment._id } },
        { new: true }
    )

    res.json(savedComment);

    } catch (error) {
        console.log(error);
        res.status(501).json({
            message: 'Не вдалось створити коментарій',
        })
    }
}