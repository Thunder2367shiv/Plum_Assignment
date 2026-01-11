import express from 'express';
import multer from 'multer';
import { handleReport } from '../controllers/reportController.js';

const router = express.Router();

/**
 * Optimized Multer Configuration
 * memoryStorage() is faster for Serverless (Vercel) as it avoids 
 * writing/reading from the local disk and provides a Buffer directly.
 */
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit to prevent memory overflow
    }
});

// The key 'report' must match the key you use in Postman/Frontend
router.post('/simplify', upload.single('report'), handleReport);

export default router;