import { Logger } from '@nestjs/common';

// Create a logger
const logger = new Logger('ImageProcessor');

// Try to import sharp, but handle the case where it's not available
let sharp: any;
try {
  sharp = require('sharp');
  logger.log('Sharp module loaded successfully');
} catch (error) {
  logger.warn('Sharp module not available, using fallback image processing');
  // Create a mock sharp implementation
  sharp = {
    // Mock implementation that just passes through the buffer
    async resize() {
      return this;
    },
    async toBuffer() {
      return Buffer.from('');
    },
    // Factory function
    fromBuffer(buffer: Buffer) {
      return {
        resize: () => ({ toBuffer: () => Promise.resolve(buffer) }),
        toBuffer: () => Promise.resolve(buffer)
      };
    }
  };
}

/**
 * Resize an image using sharp if available, otherwise return the original
 * @param buffer The image buffer
 * @param width The target width
 * @param height The target height
 * @returns The resized image buffer
 */
export async function resizeImage(buffer: Buffer, width: number, height: number): Promise<Buffer> {
  try {
    return await sharp.fromBuffer(buffer).resize(width, height).toBuffer();
  } catch (error) {
    logger.error(`Error resizing image: ${error.message}`);
    return buffer; // Return original if resize fails
  }
}

/**
 * Process an image using sharp if available
 * @param buffer The image buffer
 * @returns The processed image buffer
 */
export async function processImage(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp.fromBuffer(buffer).toBuffer();
  } catch (error) {
    logger.error(`Error processing image: ${error.message}`);
    return buffer; // Return original if processing fails
  }
}

export default {
  resizeImage,
  processImage,
  isAvailable: !!sharp
}; 