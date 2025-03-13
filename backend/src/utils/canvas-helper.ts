/**
 * Helper module for canvas functionality with fallback for environments where canvas is not available
 */

let Canvas: any = null;
let createCanvas: any = null;
let loadImage: any = null;

try {
  // Try to import canvas
  const canvasModule = require('canvas');
  Canvas = canvasModule.Canvas;
  createCanvas = canvasModule.createCanvas;
  loadImage = canvasModule.loadImage;
  console.log('Canvas module loaded successfully');
} catch (error) {
  console.warn('Canvas module not available, using fallback implementation');
  
  // Fallback implementation
  createCanvas = (width: number, height: number) => {
    return {
      width,
      height,
      getContext: () => ({
        drawImage: () => {},
        fillRect: () => {},
        fillText: () => {},
        measureText: () => ({ width: 0 }),
        // Add other context methods as needed
      }),
      toBuffer: () => Buffer.from([]),
      toDataURL: () => 'data:image/png;base64,',
    };
  };
  
  loadImage = async () => {
    return {
      width: 0,
      height: 0,
    };
  };
}

export { Canvas, createCanvas, loadImage }; 