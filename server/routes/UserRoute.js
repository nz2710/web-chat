import express from 'express'
import { getAllUsers, getUser, updateUser } from '../controllers/UserController.js'
import authMiddleWare from '../middleware/AuthMiddleware.js';

const router = express.Router()

router.get('/:id', getUser);
router.get('/',getAllUsers)
router.put('/:id', authMiddleWare, updateUser)

export default router