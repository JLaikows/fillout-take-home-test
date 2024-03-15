import express from 'express'
import formsApi from './api/forms'

const router = express.Router()

router.use('/forms', formsApi)

export default router