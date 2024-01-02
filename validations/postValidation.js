import { body } from "express-validator";

export const postValidator = [
    body('title','Мінімальна кількість символів для заголовку - 3').isLength({min: 3}),
    body('text','Мінімальна кількість символів - 5').isLength({min: 5}),
    body('tags','Теги повинні бути в масиві').isArray(),
    body('imageUrl').optional().isURL()
]