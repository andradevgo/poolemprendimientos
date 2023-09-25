import express from 'express'
import { emprendimientos } from '../controllers/apiController.js'

const router = express.Router()

router.get('/emprendimientos', emprendimientos)

export default router