import express from 'express'
import { updateRoom, createRoom, getRoom, findRoom } from '../controllers/RoomController.js'

const router = express.Router()

router.get('/:id', getRoom)
router.post('/', createRoom)
router.patch('/:id', updateRoom)
router.put('/', findRoom)

export default router