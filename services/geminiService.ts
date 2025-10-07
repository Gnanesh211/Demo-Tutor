import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION_TEMPLATE } from "../constants";

let ai: GoogleGenAI | null = null;

const getAi = (): GoogleGenAI => {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

interface Callbacks {
  onopen: () => void;
  onmessage: (message: LiveServerMessage) => void;
  onclose: (e: CloseEvent) => void;
  onerror: (e: ErrorEvent) => void;
}

export const connectToLiveSession = async (language: string, callbacks: Callbacks): Promise<LiveSession> => {
  const genAI = getAi();
  const systemInstruction = SYSTEM_INSTRUCTION_TEMPLATE.replace(/{language}/g, language);

  const sessionPromise = genAI.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      systemInstruction,
    },
  });
  return sessionPromise;
};
