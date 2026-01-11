import Tesseract from "tesseract.js";

/**
 * Utility to convert image buffers directly to text.
 * Optimized for Vercel by avoiding Base64 overhead.
 */
export const performOCR = async (imageBuffer) => {
  try {
    // recognize() can take a Buffer directly, which is faster than Base64
    const { data } = await Tesseract.recognize(imageBuffer, "eng");
    
    return {
      text: data.text,
      confidence: data.confidence / 100,
    };
  } catch (err) {
    console.error("OCR Utility Error:", err);
    // Throw error so it hits the controller's catch block
    throw new Error("OCR processing timed out or failed.");
  }
};