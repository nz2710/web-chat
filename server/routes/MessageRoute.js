import express from 'express';
import { addMessage, getMessages } from '../controllers/MessageController.js';

const router = express.Router();

router.post('/', addMessage);

router.get('/:roomId', getMessages);

export default router