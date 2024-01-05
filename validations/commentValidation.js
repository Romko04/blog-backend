import { body } from "express-validator";

export const commentValidator = [
    body('text','Мінімальна кількість символів для заголовку - 1').isLength({min: 1}),
]