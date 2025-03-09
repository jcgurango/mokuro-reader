import fs from 'fs';
import path from 'path';
import mime from 'mime';

export async function GET({ params }) {
  const { filename } = params;

  // Build the full path to the requested image
  const imagePath = path.join(process.cwd(), '_library', filename);

  try {
    // Read the file from disk
    const fileBuffer = fs.readFileSync(imagePath);

    // Determine MIME type (simple approach). For production,
    // you might use 'mime' package or a switch statement for more accuracy.
    let contentType = mime.getType(filename) || 'application/octet-stream';

    if (filename.endsWith('.mokuro')) {
      contentType = 'application/json';
    }

    // Return the file in a Response object with appropriate headers
    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.byteLength.toString()
      }
    });
  } catch (error) {
    // If the file isn't found or can't be read, return a 404
    return new Response('Not found', { status: 404 });
  }
}
