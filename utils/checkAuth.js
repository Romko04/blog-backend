import jwt from "jsonwebtoken";

export default (req, res, next) => {
    const authorizationHeader = req.headers.authorization


    if (!authorizationHeader) {
        return res.status(401).json({ message: 'Немає доступа' })
    }

    const [tokenType, token] = authorizationHeader.split(' ');

    if (token) {
        const decoded = jwt.decode(token)
        req.userId = decoded._id
    }
    next()
}