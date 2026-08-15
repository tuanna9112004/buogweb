export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

/**
 * Uploads a file to /api/admin/upload with real upload-progress events.
 * `fetch` has no upload progress API, so this uses XMLHttpRequest directly —
 * lets the UI show a live percentage instead of an indefinite spinner,
 * which matters most for larger audio files.
 */
export function uploadFile(
  file: File,
  module: string,
  type: 'images' | 'audio' | 'covers',
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('module', module);
    formData.append('type', type);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/upload');

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(new Error(data.error || 'Lỗi upload file'));
        }
      } catch {
        reject(new Error('Phản hồi không hợp lệ từ server'));
      }
    };

    xhr.onerror = () => reject(new Error('Lỗi kết nối khi upload file'));

    xhr.send(formData);
  });
}
