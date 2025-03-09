import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';
import type { MokuroData } from '$lib/types';

export async function GET({ params }) {
  const { filename } = params;

  // Build the full path to the requested image
  const cachePath = path.join(process.cwd(), '_library-cache', filename + '.cover');
  const filePath = path.join(process.cwd(), '_library', filename);
  let found = true;

  try {
    if (!fs.existsSync(cachePath)) {
      found = false;

      // Read metadata.
      const zip = await unzipper.Open.file(filePath);

      for (let file of zip.files) {
        if (file.path.endsWith('.mokuro')) {
          const {
            pages: [{ img_path }]
          }: MokuroData = JSON.parse((await file.buffer()).toString('utf-8'));

          // Get title name, UUID
          const entryPath = path.parse(file.path);
          const coverPhotoPath = path.join(entryPath.dir, entryPath.name, img_path);
          const coverPhotoFile = zip.files.find(({ path }) => path === coverPhotoPath);

          if (coverPhotoFile) {
            await new Promise((resolve, reject) => {
              coverPhotoFile.stream().pipe(fs.createWriteStream(cachePath))
                .on('error', reject)
                .on('finish', () => resolve(undefined));
            });

            found = true;
          }
        }
      }
    }

    if (found) {
      return new Response(fs.readFileSync(cachePath));
    }
  } catch (error) {
    console.error(error);
  }

  // If the file isn't found or can't be read, return a 404
  return new Response('Not found', { status: 404 });
}
