import { body } from "express-validator";

export const registerValidator = [
    body('email','Неправильний формат емейлу').isEmail(),
    body('password','Мінімальна кількість символів для пароля - 5').isLength({min: 5}),
    body('username','Мінімальна кількість символів для логіна - 3').isLength({min: 3}),
    body('avatarUrl').optional().isURL()
]