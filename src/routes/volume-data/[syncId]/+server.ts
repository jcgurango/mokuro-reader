import type { RequestHandler } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs';

const volumeDataPath = path.join(process.cwd(), '_volume-data');

export const POST: RequestHandler = async ({ request, params }) => {
  try {
    const { syncId } = params;
    const body = await request.json();

    fs.writeFileSync(path.join(volumeDataPath, syncId + '.json'), JSON.stringify(body));

    // 4) Return a response
    return new Response('OK');
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: RequestHandler = async ({ params }) => {
  try {
    const { syncId } = params;
    const filePath = path.join(volumeDataPath, syncId + '.json');

    if (!fs.existsSync(filePath)) {
      return new Response('{}', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return new Response(fs.readFileSync(filePath), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
