import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';
import type { Manga, MokuroData } from '$lib/types';

export async function load() {
  const dir = path.join(process.cwd(), '_library');
  const cacheDir = path.join(process.cwd(), '_library-cache');

  let files: string[] = [];

  try {
    files = fs.readdirSync(dir);
  } catch (err) {
    console.error(err);
    files = [];
  }

  const manga: Manga[] = [];

  for (let file of files) {
    if (file.endsWith('.zip')) {
      const metaPath = path.join(cacheDir, file + '.meta');
      let found = true;

      if (!fs.existsSync(metaPath)) {
        found = false;

        // Read metadata.
        const zip = await unzipper.Open.file(path.join(dir, file));

        for (let file of zip.files) {
          if (file.path.endsWith('.mokuro')) {
            await new Promise((resolve, reject) => {
              file.stream().pipe(fs.createWriteStream(metaPath))
                .on('error', reject)
                .on('finish', () => resolve(undefined));
            });

            found = true;
            break;
          }
        }
      }

      if (found) {
        const { title, title_uuid }: MokuroData = JSON.parse(
          fs.readFileSync(metaPath, { encoding: 'utf-8' })
        );

        // Get title name, UUID
        manga.push({
          id: title_uuid,
          title: title,
          filename: file
        });
      }
    }
  }

  return {
    manga
  };
}
