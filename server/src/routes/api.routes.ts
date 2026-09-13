import {Request, Response, Router} from 'express'
import { getData } from '../controllers/api.controller.js'
const router  = Router()
router.post('/analyze',getData)
export default router