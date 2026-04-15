import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<string> {
    const fileName = `${uuidv4()}-${file.originalname}`;
    const folderPath = join(process.cwd(), folder);
    if (!existsSync(folderPath)) {
      mkdirSync(folderPath, { recursive: true });
    }
    const filePath = join(process.cwd(), folder, fileName);

    // Ensure folder exists (simplified)
    const writeStream = createWriteStream(filePath);
    writeStream.write(file.buffer);
    writeStream.end();

    return `/${folder}/${fileName}`;
  }
}
