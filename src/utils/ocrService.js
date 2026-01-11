import Tesseract from "tesseract.js";

/**
 * Utility to convert image buffers/base64 to text
 */
export const performOCR = async (base64Image) => {
  try {
    const buffer = Buffer.from(base64Image, "base64");
    const { data } = await Tesseract.recognize(buffer, "eng");
    
    return {
      text: data.text,
      confidence: data.confidence / 100,
    };
  } catch (err) {
    console.error("OCR Utility Error:", err);
    return { text: "", confidence: 0 };
  }
};