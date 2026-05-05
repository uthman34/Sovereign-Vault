import { GoogleGenAI } from "@google/genai";

let aiInstance = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "") {
      throw new Error("Gemini API Key is missing. If you are running locally, please add GEMINI_API_KEY to your .env file.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
    });
  }
  return aiInstance;
};

export const askAi = async (prompt, systemInstruction = "") => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "You are an intelligent assistant for the Sovereign Archive, a high-end document management system. You help users understand their archived content, provide summaries, and offer insights into their intellectual capital.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const summarizeDocument = async (text) => {
  const prompt = `Please summarize the following document content concisely, highlighting the key points and implications for high-level decision makers.\n\nContent:\n${text}`;
  return await askAi(prompt);
};

export const generateSemanticSearchQuery = async (userQuery, archiveManifest) => {
  const prompt = `The user is searching their archive for: "${userQuery}".
  Based on the following archive manifest (list of document titles and summaries), identify the most relevant documents by their conceptual meaning, not just keyword matching. Explain why they are relevant.
  
  Archive Manifest:
  ${JSON.stringify(archiveManifest, null, 2)}`;
  
  return await askAi(prompt);
};

export const performOCR = async (imageBase64) => {
  const prompt = "Extract all text from this document image accurately. Format the output to preserve the structure if possible.";
  const imagePart = {
    inlineData: {
      mimeType: "image/png",
      data: imageBase64,
    },
  };
  const textPart = { text: prompt };
  
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [imagePart, textPart] },
  });
  return response.text;
};
