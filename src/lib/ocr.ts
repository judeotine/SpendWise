
import Tesseract from 'tesseract.js';

/**
 * Detect text from an image using Tesseract OCR
 * @param imageDataUrl Base64 encoded image
 * @returns Extracted text
 */
export async function detectTextFromImage(imageDataUrl: string): Promise<string> {
  try {
    // Remove data URL prefix if present
    const base64Image = imageDataUrl.includes('data:image')
      ? imageDataUrl.split(',')[1]
      : imageDataUrl;
    
    // Enhanced configuration for receipt OCR
    const result = await Tesseract.recognize(
      imageDataUrl,
      'eng', // Language
      {
        logger: message => console.log(message), // Optional logger
        // Using recognized parameters for Tesseract.js
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        engineMode: '3', // Use LSTM neural network engine for better accuracy
        pageSegMode: '6', // Assume a single uniform block of text (receipt-like)
      }
    );
    
    return result.data.text;
  } catch (error) {
    console.error('OCR Error:', error);
    return '';
  }
}

/**
 * Enhance image for better OCR results
 * @param imageDataUrl Base64 encoded image
 * @returns Enhanced base64 image
 */
export async function enhanceImageForOCR(imageDataUrl: string): Promise<string> {
  try {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return imageDataUrl;
    
    // Create image element from data URL
    const img = new Image();
    img.src = imageDataUrl;
    
    // Process image on load
    return new Promise<string>((resolve) => {
      img.onload = () => {
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image to canvas
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Apply grayscale and increase contrast
        for (let i = 0; i < data.length; i += 4) {
          // Convert to grayscale
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          
          // Increase contrast - stretch histogram
          const contrast = 128; // Contrast factor
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          const newValue = factor * (gray - 128) + 128;
          
          // Apply threshold for clearer text (if grayscale value is above 160, make it white)
          const thresholdedValue = gray > 160 ? 255 : 0;
          
          // Set new RGB values
          data[i] = data[i + 1] = data[i + 2] = thresholdedValue;
        }
        
        // Put modified imageData back to canvas
        ctx.putImageData(imageData, 0, 0);
        
        // Convert canvas to data URL
        const enhancedImageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        
        // Return enhanced image
        resolve(enhancedImageDataUrl);
      };
      
      // If image fails to load, return original
      img.onerror = () => resolve(imageDataUrl);
    });
  } catch (error) {
    console.error('Image enhancement error:', error);
    // If any error occurs, return original
    return imageDataUrl;
  }
}

/**
 * Deskew (straighten) a receipt image
 * @param imageDataUrl Base64 encoded image
 * @returns Deskewed base64 image
 */
export function deskewImage(imageDataUrl: string): Promise<string> {
  // This is a placeholder for a more advanced deskewing algorithm
  // In a full implementation, we would use more advanced computer vision techniques
  // For now, we'll just return the original image
  return Promise.resolve(imageDataUrl);
}

/**
 * Detect and crop receipt from background
 * @param imageDataUrl Base64 encoded image
 * @returns Cropped base64 image with just the receipt
 */
export function detectAndCropReceipt(imageDataUrl: string): Promise<string> {
  // This is a placeholder for a more advanced cropping algorithm
  // In a full implementation, we would use edge detection to find receipt boundaries
  // For now, we'll just return the original image
  return Promise.resolve(imageDataUrl);
}
