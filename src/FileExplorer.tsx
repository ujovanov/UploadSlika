import { useState, useEffect } from 'react';

interface Folder {
  name: string;
  path: string;
  fileCount: number;
  createdAt: string;
  updatedAt: string;
}

interface File {
  name: string;
  path: string;
  size: number;
  isImage: boolean;
  url: string;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string;
}

const FileExplorer = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all folders
  const fetchFolders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/folders');
      const data = await response.json();
      
      if (data.success) {
        setFolders(data.folders);
      } else {
        setError(data.message || 'Failed to fetch folders');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching folders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch files in a folder
  const fetchFiles = async (folderName: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/folders/${folderName}`);
      const data = await response.json();
      
      if (data.success) {
        setFiles(data.files);
        setCurrentFolder(folderName);
      } else {
        setError(data.message || 'Failed to fetch files');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Load folders on component mount
  useEffect(() => {
    fetchFolders();
  }, []);

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
          File Explorer
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-20 border border-red-800 text-red-400 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Breadcrumb navigation */}
        <div className="flex items-center mb-4 text-gray-400">
          <button 
            onClick={() => {
              setCurrentFolder(null);
              setFiles([]);
            }}
            className="hover:text-white transition-colors"
          >
            Home
          </button>
          
          {currentFolder && (
            <>
              <span className="mx-2">/</span>
              <span className="text-gray-200 cursor-pointer" onClick={() => fetchFiles(currentFolder)}>{currentFolder}</span>
            </>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <>
            {!currentFolder ? (
              // Folder list view
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {folders.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-400">
                    No folders found. Upload some images first!
                  </div>
                ) : (
                  folders.map((folder) => (
                    <div 
                      key={folder.path}
                      onClick={() => fetchFiles(folder.name)}
                      className="bg-gray-700 bg-opacity-50 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-600 flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-gray-200 font-medium truncate">{folder.name}</p>
                          <p className="text-xs text-gray-400">{folder.fileCount} files</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // File list view
              <div>
                {files.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No files in this folder.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {files.map((file) => (
                      <div key={file.path} className="bg-gray-700 bg-opacity-50 rounded-lg overflow-hidden flex flex-col">
                        {file.isImage ? (
                          <div className="h-32 bg-gray-800 relative">
                            <img 
                              src={`http://localhost:3000${file.url}`} 
                              alt={file.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="h-32 bg-gray-800 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        )}
                        
                        <div className="p-3">
                          <p className="text-sm text-gray-200 font-medium truncate">{file.name}</p>
                          <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                          
                          <div className="mt-2 flex justify-between">
                            <a 
                              href={`http://localhost:3000${file.url}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              View
                            </a>
                            <a 
                              href={`http://localhost:3000${file.downloadUrl}`} 
                              download
                              className="text-xs text-green-400 hover:text-green-300 transition-colors"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FileExplorer; 