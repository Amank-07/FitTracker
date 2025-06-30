// Storage Service - Modified for use without Firebase Storage (requires billing)
// This service provides fallback functionality using localStorage and base64

// Store image as base64 in localStorage (temporary solution)
export const uploadFile = async (file, path, metadata = {}) => {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result;
        const fileId = Date.now().toString();
        
        // Store in localStorage (temporary solution)
        const fileData = {
          id: fileId,
          path,
          data: base64Data,
          metadata,
          uploadedAt: new Date().toISOString()
        };
        
        localStorage.setItem(`file_${fileId}`, JSON.stringify(fileData));
        
        resolve({
          success: true,
          downloadURL: base64Data,
          path: path,
          fileId: fileId
        });
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Upload progress photo (base64 version)
export const uploadProgressPhoto = async (file, userId, type = 'front') => {
  try {
    const timestamp = Date.now();
    const fileName = `${userId}_${type}_${timestamp}.jpg`;
    const path = `progress-photos/${userId}/${fileName}`;
    
    const metadata = {
      contentType: 'image/jpeg',
      customMetadata: {
        userId,
        type,
        timestamp: timestamp.toString()
      }
    };

    return await uploadFile(file, path, metadata);
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Upload profile picture (base64 version)
export const uploadProfilePicture = async (file, userId) => {
  try {
    const timestamp = Date.now();
    const fileName = `${userId}_profile_${timestamp}.jpg`;
    const path = `profile-pictures/${userId}/${fileName}`;
    
    const metadata = {
      contentType: 'image/jpeg',
      customMetadata: {
        userId,
        timestamp: timestamp.toString()
      }
    };

    return await uploadFile(file, path, metadata);
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get file from localStorage
export const getFileDownloadURL = async (fileId) => {
  try {
    const fileData = localStorage.getItem(`file_${fileId}`);
    if (fileData) {
      const parsed = JSON.parse(fileData);
      return {
        success: true,
        downloadURL: parsed.data
      };
    } else {
      return {
        success: false,
        error: 'File not found'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete file from localStorage
export const deleteFile = async (fileId) => {
  try {
    localStorage.removeItem(`file_${fileId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// List files from localStorage
export const listFiles = async (path) => {
  try {
    const files = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('file_')) {
        try {
          const fileData = JSON.parse(localStorage.getItem(key));
          if (fileData.path.startsWith(path)) {
            files.push({
              name: fileData.path.split('/').pop(),
              fullPath: fileData.path,
              downloadURL: fileData.data,
              id: fileData.id
            });
          }
        } catch (e) {
          // Skip invalid entries
        }
      }
    }
    
    return {
      success: true,
      files
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get user's progress photos
export const getUserProgressPhotos = async (userId) => {
  try {
    const path = `progress-photos/${userId}`;
    return await listFiles(path);
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete user's progress photo
export const deleteProgressPhoto = async (userId, fileName) => {
  try {
    // Find the file in localStorage and delete it
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('file_')) {
        try {
          const fileData = JSON.parse(localStorage.getItem(key));
          if (fileData.path.includes(fileName)) {
            localStorage.removeItem(key);
            break;
          }
        } catch (e) {
          // Skip invalid entries
        }
      }
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Compress image before upload (helper function)
export const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };

    img.src = URL.createObjectURL(file);
  });
};

// Note: This is a temporary solution until Firebase Storage billing is set up
// For production, you should enable Firebase Storage billing or use an alternative service 