import User from '../models/User.js';
import express from 'express';
import { validationResult, body  } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fetchuser from '../middleware/fetchuser.js';

const router = express.Router()
//ROUTE 1: create a user using: POST '/api/auth/signup'
router.post('/signup', [
    body('email', 'Enter a valid email').isEmail(),
    body('name', 'Enter a valid name').isString(),
    body('password', 'Password must be at least 6 characters long').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }else{

    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: 'A user with this email already exists!' });
        }else{
        const JWT_SECRET = process.env.JWT_SECRET;
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        const createdUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
            date: Date.now()
        })
        const data = {
            user: {
                id: createdUser.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        return res.status(200).json({ authToken });
    }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
}
})

//ROUTE 2: login a user using: POST '/api/auth/login'
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Please login with correct credentials" });
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Please login with correct credentials" });
        }
        const data = {
            user: {
                id: user.id
            }
        }
        const JWT_SECRET = process.env.JWT_SECRET;
        const authToken = jwt.sign(data, JWT_SECRET);
        return res.status(200).json({ authToken });
    } catch (error) {
        return res.status(500).json({ error });
    }
})

//ROUTE 3: get a user using: GET '/api/auth/getuser'
router.get('/me', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ error });
    }
})

export default router;