import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PhotoVerificationService } from '../photoVerificationService';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Initialize photo verification service
const photoVerificationService = new PhotoVerificationService({
  baseUrl: process.env.PYTHON_VERIFICATION_SERVICE_URL || 'http://localhost:8000',
  timeout: 30000,
  maxRetries: 3
});

/**
 * POST /api/verify-photo
 * Verify a single photo for task submission
 */
router.post('/verify-photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    const {
      taskType,
      locationLat,
      locationLng,
      locationRadius,
      deadlineStart,
      deadlineEnd,
      userId,
      requiresVideo
    } = req.body;

    // Validate required fields
    if (!taskType || !locationLat || !locationLng || !deadlineStart || !deadlineEnd || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields: taskType, locationLat, locationLng, deadlineStart, deadlineEnd, userId' 
      });
    }

    // Prepare verification data
    const verificationData = {
      taskType,
      location: {
        lat: parseFloat(locationLat),
        lng: parseFloat(locationLng)
      },
      locationRadius: parseFloat(locationRadius) || 100,
      deadlineStart,
      deadlineEnd,
      userId,
      requiresVideo: requiresVideo === 'true'
    };

    // Verify photo using Python service
    const result = await photoVerificationService.verifyPhoto(
      req.file.path,
      verificationData
    );

    if (result.success) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      res.json({
        success: true,
        data: result.data,
        filename: result.filename
      });
    } else {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Photo verification error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: 'Photo verification failed',
      details: error.message
    });
  }
});

/**
 * POST /api/verify-multiple-photos
 * Verify multiple photos for task submission
 */
router.post('/verify-multiple-photos', upload.array('photos', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No photos uploaded' });
    }

    const {
      taskType,
      locationLat,
      locationLng,
      locationRadius,
      deadlineStart,
      deadlineEnd,
      userId
    } = req.body;

    // Validate required fields
    if (!taskType || !locationLat || !locationLng || !deadlineStart || !deadlineEnd || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields: taskType, locationLat, locationLng, deadlineStart, deadlineEnd, userId' 
      });
    }

    // Prepare verification data
    const verificationData = {
      taskType,
      location: {
        lat: parseFloat(locationLat),
        lng: parseFloat(locationLng)
      },
      locationRadius: parseFloat(locationRadius) || 100,
      deadlineStart,
      deadlineEnd,
      userId
    };

    // Get file paths
    const filePaths = req.files.map(file => file.path);

    // Verify photos using Python service
    const result = await photoVerificationService.verifyMultiplePhotos(
      filePaths,
      verificationData
    );

    // Clean up uploaded files
    req.files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        totalFiles: result.totalFiles
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Multiple photo verification error:', error);
    
    // Clean up uploaded files if they exist
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Multiple photo verification failed',
      details: error.message
    });
  }
});

/**
 * POST /api/extract-metadata
 * Extract EXIF metadata from uploaded photo
 */
router.post('/extract-metadata', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    // Extract metadata using Python service
    const result = await photoVerificationService.extractMetadata(req.file.path);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        filename: result.filename
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Metadata extraction error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: 'Metadata extraction failed',
      details: error.message
    });
  }
});

/**
 * GET /api/verification-health
 * Check health of photo verification service
 */
router.get('/verification-health', async (req, res) => {
  try {
    const healthCheck = await photoVerificationService.checkHealth();
    
    if (healthCheck.success) {
      res.json({
        success: true,
        data: healthCheck.data,
        service: 'Photo Verification Service'
      });
    } else {
      res.status(503).json({
        success: false,
        error: 'Photo verification service is not responding',
        details: healthCheck.error
      });
    }

  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      success: false,
      error: 'Health check failed',
      details: error.message
    });
  }
});

/**
 * POST /api/process-verification-results
 * Process verification results and generate summary
 */
router.post('/process-verification-results', async (req, res) => {
  try {
    const { results, taskDetails } = req.body;

    if (!results || !taskDetails) {
      return res.status(400).json({ 
        error: 'Missing required fields: results, taskDetails' 
      });
    }

    // Process verification results
    const summary = photoVerificationService.processVerificationResults(results);
    
    // Generate verification report
    const report = photoVerificationService.generateVerificationReport(summary, taskDetails);

    res.json({
      success: true,
      summary,
      report
    });

  } catch (error) {
    console.error('Result processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Result processing failed',
      details: error.message
    });
  }
});

export default router;
