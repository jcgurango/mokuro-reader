import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { Manga, MokuroData } from '$lib/types';

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
                const zip = new AdmZip(path.join(dir, file));
                const entries = zip.getEntries();
                
                for (let entry of entries) {
                    if (entry.entryName.endsWith('.mokuro')) {
                        fs.writeFileSync(metaPath, zip.readAsText(entry));
                        found = true;
                        break;
                    }
                }
            }

            if (found) {
                const {
                    title,
                    title_uuid,
                }: MokuroData = JSON.parse(fs.readFileSync(metaPath, { encoding: 'utf-8' }));

                // Get title name, UUID
                manga.push({
                    id: title_uuid,
                    title: title,
                    filename: file,
                });
            }
        }
    }

    return {
        manga,
    };
}
