import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for temporary storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store files in a temporary directory first
    const tempDir = path.join(uploadsDir, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'));
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

// Upload endpoint
app.post('/upload', upload.array('images'), (req, res) => {
  try {
    const { folderName } = req.body;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    if (!folderName) {
      return res.status(400).json({ success: false, message: 'Folder name is required' });
    }
    
    // Create the target folder
    const targetDir = path.join(uploadsDir, folderName);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Move files from temp to target folder
    const movedFiles = [];
    for (const file of files) {
      const oldPath = file.path;
      const newPath = path.join(targetDir, file.filename);
      fs.renameSync(oldPath, newPath);
      
      // Update file path
      file.path = newPath;
      movedFiles.push({
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        path: newPath.replace(/\\/g, '/').split('uploads/')[1] // Return relative path
      });
    }
    
    // Return success with file information
    return res.status(200).json({ 
      success: true, 
      message: `${files.length} files uploaded successfully to folder "${folderName}"`,
      files: movedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error uploading files',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all folders
app.get('/folders', (req, res) => {
  try {
    const folders = fs.readdirSync(uploadsDir)
      .filter(item => {
        // Filter out temp directory and non-directories
        const itemPath = path.join(uploadsDir, item);
        return fs.statSync(itemPath).isDirectory() && item !== 'temp';
      })
      .map(folder => {
        const folderPath = path.join(uploadsDir, folder);
        const stats = fs.statSync(folderPath);
        const fileCount = fs.readdirSync(folderPath).length;
        
        return {
          name: folder,
          path: folder,
          fileCount,
          createdAt: stats.birthtime,
          updatedAt: stats.mtime
        };
      });
    
    return res.status(200).json({ 
      success: true, 
      folders
    });
  } catch (error) {
    console.error('Error listing folders:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error listing folders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get files in a folder
app.get('/folders/:folderName', (req, res) => {
  try {
    const { folderName } = req.params;
    const folderPath = path.join(uploadsDir, folderName);
    
    if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ 
        success: false, 
        message: `Folder "${folderName}" not found`
      });
    }
    
    const files = fs.readdirSync(folderPath)
      .filter(file => {
        const filePath = path.join(folderPath, file);
        return fs.statSync(filePath).isFile();
      })
      .map(file => {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);
        const ext = path.extname(file).toLowerCase();
        
        // Determine if it's an image based on extension
        const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'].includes(ext);
        
        return {
          name: file,
          path: `${folderName}/${file}`,
          size: stats.size,
          isImage,
          url: `/uploads/${folderName}/${file}`,
          downloadUrl: `/download/${folderName}/${file}`,
          createdAt: stats.birthtime,
          updatedAt: stats.mtime
        };
      });
    
    return res.status(200).json({ 
      success: true, 
      folder: folderName,
      files
    });
  } catch (error) {
    console.error('Error listing files:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error listing files',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Download a file
app.get('/download/:folderName/:fileName', (req, res) => {
  try {
    const { folderName, fileName } = req.params;
    const filePath = path.join(uploadsDir, folderName, fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: `File "${fileName}" not found in folder "${folderName}"`
      });
    }
    
    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error downloading file',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../dist')));

// The "catch-all" handler: for any request that doesn't match the ones above,
// send back the React app's index.html file.
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/folders') || 
      req.path.startsWith('/upload') || 
      req.path.startsWith('/download')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Upload endpoint: http://localhost:${PORT}/upload`);
  console.log(`Files will be stored in: ${uploadsDir}`);
});

export default app; 