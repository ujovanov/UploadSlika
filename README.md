# Image Uploader

A modern web application for uploading multiple images to organized folders.

## Features

- Drag and drop interface for easy file selection
- Multiple file upload support
- Custom folder naming for organization
- Real-time upload status and feedback
- Responsive design with Tailwind CSS
- Preview thumbnails of selected images

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, Multer
- **Storage**: Local file system (configurable)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd uploadslikaucionice
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   PORT=3000
   MAX_FILE_SIZE=10485760 # 10MB in bytes
   ```

### Running the Application

#### Development Mode

1. Start the backend server:
   ```bash
   npm run server:dev
   ```

2. In a separate terminal, start the frontend development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

#### Production Mode

1. Build the application:
   ```bash
   npm run build
   npm run server:build
   ```

2. Start the production server:
   ```bash
   npm run server:start
   ```

## API Endpoints

### Upload Images

- **URL**: `/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `images`: Array of image files
  - `folderName`: String (name of the folder to store images)
- **Response**:
  ```json
  {
    "success": true,
    "message": "3 files uploaded successfully to folder 'Uroseve slike'",
    "files": [
      {
        "filename": "images-1621234567890-123456789.jpg",
        "size": 1024000,
        "mimetype": "image/jpeg",
        "path": "Uroseve slike/images-1621234567890-123456789.jpg"
      }
    ]
  }
  ```

## Folder Structure

- `/src` - Frontend React application
- `/server` - Backend Express server
- `/uploads` - Uploaded files (organized by folder name)
- `/dist` - Compiled application

## License

This project is licensed under the MIT License - see the LICENSE file for details.
