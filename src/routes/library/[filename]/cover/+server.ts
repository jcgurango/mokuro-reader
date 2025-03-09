import fs from 'fs';
import path from 'path';
import mime from 'mime';
import AdmZip from 'adm-zip';
import { MokuroData } from '$lib/types/index.js';

export async function GET({ params }) {
  const { filename } = params;

  // Build the full path to the requested image
  const cachePath = path.join(process.cwd(), '_library-cache', filename + '.cover');
  const filePath = path.join(process.cwd(), '_library', filename);

  try {
    if (!fs.existsSync(cachePath)) {
      // Read metadata.
      const zip = new AdmZip(filePath);
      const entries = zip.getEntries();

      for (let entry of entries) {
        if (entry.entryName.endsWith('.mokuro')) {
          const {
            pages: [{ img_path }]
          }: MokuroData = JSON.parse(zip.readAsText(entry));

          // Get title name, UUID
          const entryPath = path.parse(entry.entryName);
          const coverPhotoPath = path.join(entryPath.dir, entryPath.name, img_path);
          zip.extractEntryTo(
            coverPhotoPath,
            path.dirname(cachePath),
            false,
            true,
            false,
            path.basename(cachePath)
          );
        }
      }
    }

    return new Response(fs.readFileSync(cachePath));
  } catch (error) {
    console.error(error);
  }

  // If the file isn't found or can't be read, return a 404
  return new Response('Not found', { status: 404 });
}
