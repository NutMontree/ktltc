import { unlink } from 'fs/promises';
import { join } from 'path';

/**
 * Deletes a file from the public directory based on its media API URL
 * URL format: /api/media/folder/subfolder/filename.ext
 */
export async function deleteFileFromUrl(url: string): Promise<boolean> {
  if (!url || !url.startsWith('/api/media/')) {
    return false;
  }

  try {
    // Extract path from /api/media/...
    const relativePath = url.replace('/api/media/', '');
    const parts = relativePath.split('/');
    const filePath = join(process.cwd(), 'public', ...parts);

    // Security check: ensure the file is within the public directory
    const publicDir = join(process.cwd(), 'public');
    if (!filePath.startsWith(publicDir)) {
      console.warn(`Security warning: Attempted to delete file outside public directory: ${filePath}`);
      return false;
    }

    await unlink(filePath);
    return true;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File already doesn't exist, count as success or ignore
      return true;
    }
    console.error(`Error deleting file: ${url}`, error);
    return false;
  }
}
