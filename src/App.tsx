import { useState } from 'react'
import './App.css'
import FileExplorer from './FileExplorer'

function App() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [activeTab, setActiveTab] = useState<'upload' | 'explorer'>('upload')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (files.length === 0) {
      setUploadStatus('Please select at least one file')
      return
    }

    if (!folderName.trim()) {
      setUploadStatus('Please enter a folder name')
      return
    }

    setUploading(true)
    setUploadStatus('Uploading...')
    
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('images', file)
      })
      
      // Add folder name to the form data
      formData.append('folderName', folderName.trim())
      
      // Use relative URL for server endpoint
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setUploadStatus(`${result.message}`)
        setFiles([])
      } else {
        setUploadStatus(`Upload failed: ${result.message || 'Unknown error'}`)
      }
    } catch (error) {
      setUploadStatus('Error uploading files. Please try again.')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
            Image Uploader
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Upload multiple images to our secure cloud storage with just a few clicks
          </p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`py-2 px-4 font-medium text-sm focus:outline-none ${
              activeTab === 'upload'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('upload')}
          >
            Upload Images
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm focus:outline-none ${
              activeTab === 'explorer'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('explorer')}
          >
            File Explorer
          </button>
        </div>
        
        {activeTab === 'upload' ? (
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
            <div className="p-6 sm:p-8">
              <form onSubmit={handleUpload}>
                <div className="mb-6">
                  <label htmlFor="folderName" className="block text-sm font-medium text-gray-300 mb-2">
                    Folder Name
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z" clipRule="evenodd" />
                        <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="folderName"
                      name="folderName"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      placeholder="Enter folder name (e.g. Uroseve slike)"
                      className="bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 pr-3 py-3 rounded-md"
                      disabled={uploading}
                      required
                    />
                  </div>
                </div>
                
                <div 
                  className={`relative mb-6 border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ease-in-out ${
                    dragActive 
                      ? 'border-purple-500 bg-purple-500 bg-opacity-10' 
                      : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700 hover:bg-opacity-30'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  
                  <div className="space-y-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-300 font-medium">Drag & drop your images here</p>
                    <p className="text-gray-500 text-sm">or click to browse files</p>
                  </div>
                </div>
                
                {files.length > 0 && (
                  <div className="mb-6 bg-gray-700 bg-opacity-50 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-gray-800 bg-opacity-70 flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-300">
                        Selected <span className="text-purple-400 font-semibold">{files.length}</span> file(s)
                      </p>
                      <button 
                        type="button" 
                        onClick={() => setFiles([])}
                        disabled={uploading}
                        className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                    <ul className="max-h-60 overflow-y-auto divide-y divide-gray-700">
                      {files.map((file, index) => (
                        <li key={index} className="px-4 py-3 flex items-center text-sm text-gray-300">
                          <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-600 flex items-center justify-center mr-3">
                            {file.type.startsWith('image/') && (
                              <img 
                                src={URL.createObjectURL(file)} 
                                alt={file.name} 
                                className="h-10 w-10 object-cover rounded"
                                onLoad={() => URL.revokeObjectURL(URL.createObjectURL(file))}
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{file.name}</p>
                            <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <button 
                  type="submit" 
                  disabled={uploading || files.length === 0 || !folderName.trim()}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                    uploading || files.length === 0 || !folderName.trim()
                      ? 'bg-gray-700 cursor-not-allowed text-gray-500' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  {uploading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : 'Upload Images'}
                </button>
                
                {uploadStatus && (
                  <div className={`mt-6 p-4 rounded-lg transition-all duration-300 ${
                    uploadStatus.includes('successful') 
                      ? 'bg-green-900 bg-opacity-20 border border-green-800 text-green-400' 
                      : uploadStatus.includes('Uploading') 
                        ? 'bg-blue-900 bg-opacity-20 border border-blue-800 text-blue-400'
                        : 'bg-red-900 bg-opacity-20 border border-red-800 text-red-400'
                  }`}>
                    <div className="flex items-center">
                      {uploadStatus.includes('successful') && (
                        <svg className="h-5 w-5 mr-2 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                      {uploadStatus.includes('Uploading') && (
                        <svg className="animate-spin h-5 w-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {!uploadStatus.includes('successful') && !uploadStatus.includes('Uploading') && (
                        <svg className="h-5 w-5 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      <p className="font-medium">{uploadStatus}</p>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        ) : (
          <FileExplorer />
        )}
        
        <div className="mt-8 text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} Image Uploader. All rights reserved.
        </div>
      </div>
    </div>
  )
}

export default App
