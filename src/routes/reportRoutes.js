import express from 'express';
import multer from 'multer';
import { handleReport } from '../controllers/reportController.js';

const router = express.Router();
const upload = multer({ dest: '/tmp' });

router.post('/simplify', upload.single('report'), handleReport);

export default router;  