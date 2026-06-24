import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("A variável de ambiente GEMINI_API_KEY não foi configurada. Configure as credenciais no painel de Secrets do AI Studio.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// API Route for Text-To-Speech (TTS)
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voice = "Kore" } = req.body;
    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "Texto ausente ou inválido." });
      return;
    }

    const ai = getGeminiClient();

    // Instruct Gemini as a loving Portuguese storyteller for the child
    const systemPrompt = `Você é um contador de histórias infantil brasileiro de voz mansa, acolhedora, expressiva e cativante. Leia o parágrafo a seguir de forma natural, respeitando pontuações e encenações de forma calma.`;

    const fullPrompt = `Say cheerfully and warmly: ${text}`;

    // Invoke text-to-speech task under gemini-3.1-flash-tts-preview
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `${systemPrompt}\n\nTexto: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice as any }, // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      res.status(502).json({ error: "O modelo Gemini não retornou dados de áudio válidos." });
      return;
    }

    res.json({ audio: base64Audio });
  } catch (error: any) {
    console.error("Erro no processamento de TTS:", error);
    res.status(500).json({
      error: "Falha ao gerar o áudio de narração.",
      details: error.message || error,
    });
  }
});

// Vite server connection integration
import { createServer as createViteServer } from "vite";

async function startServer() {
  // Servir a pasta de áudios diretamente do public/audio em produção e desenvolvimento
  app.use("/audio", express.static(path.join(process.cwd(), "public", "audio")));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
