import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

interface StorageFile {
  url: string;
  localPath: string;
  fileName: string;
  mimeType: string;
  size: number;
  provider: string;
}

@Injectable()
export class StorageService {
  private readonly uploadDir = path.join(
    process.cwd(),
    'uploads',
    'blogs',
  );

  constructor() {
    this.ensureDirectory();
  }

  /**
   * Create uploads/blogs directory if it doesn't exist
   */
  private ensureDirectory() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, {
        recursive: true,
      });
    }
  }

  /**
   * Save image locally
   */
  async saveImage(
    buffer: Buffer,
    mimeType = 'image/png',
  ): Promise<StorageFile> {
    const extension =
      mimeType.split('/')[1] || 'png';

    const fileName =
      `${randomUUID()}.${extension}`;

    const absolutePath =
      path.join(
        this.uploadDir,
        fileName,
      );

    await fs.promises.writeFile(
      absolutePath,
      buffer,
    );

    return {
      provider: 'local',

      fileName,

      localPath: absolutePath,

      url: `/uploads/blogs/${fileName}`,

      mimeType,

      size: buffer.length,
    };
  }

  /**
   * Delete image
   */
  async deleteImage(
    localPath: string,
  ): Promise<void> {
    if (
      fs.existsSync(localPath)
    ) {
      await fs.promises.unlink(
        localPath,
      );
    }
  }

  /**
   * Read image
   */
  async getImage(
    localPath: string,
  ): Promise<Buffer> {
    return fs.promises.readFile(
      localPath,
    );
  }

  /**
   * Check file exists
   */
  exists(
    localPath: string,
  ): boolean {
    return fs.existsSync(
      localPath,
    );
  }
}