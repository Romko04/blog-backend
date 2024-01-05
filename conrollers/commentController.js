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
export const updateComment = async (req, res) => {

    try {
       
    const userId = req.userId
    const commentId = req.params.id

    const { text } = req.body

    const comment = await Comment.findById(commentId)

    if (!comment || userId !== comment.user.toString()) {
        return res.status(403).json({
            message: 'Ви не маєте прав для редагування цього коментаря',
        });
    }

    comment.text = text

    await comment.save();
    console.log(comment);

    res.json({
        message: 'Коментар успішно відредаговано',
        updatedComment: comment,
    });

    } catch (error) {
        console.log(error);
        res.status(501).json({
            message: 'Не вдалось обновити коментарій',
        })
    }
}
export const deleteComment = async (req, res) => {
    try {
        const userId = req.userId
        const commentId = req.params.id
    
        const comment = await Comment.findById(commentId)
    
        if (!comment || userId !== comment.user.toString()) {
            return res.status(403).json({
                message: 'Ви не маєте прав для видалення цього коментаря',
            });
        }
    
        await comment.deleteOne();
    
        res.json({
            message: 'Коментар успішно видалено',
        });
    
        } catch (error) {
            console.log(error);
            res.status(501).json({
                message: 'Не вдалось видалити коментарій',
            })
        }
}
