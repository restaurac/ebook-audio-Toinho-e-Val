import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { bookPages } from "./src/data.js";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("ERRO: GEMINI_API_KEY não encontrada no arquivo .env ou variáveis de ambiente.");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

function createWavBuffer(pcmBuffer: Buffer, sampleRate: number = 24000): Buffer {
  const header = Buffer.alloc(44);
  const blockAlign = 2; // 1 channel * 16-bit (2 bytes)
  const byteRate = sampleRate * blockAlign;
  const dataLength = pcmBuffer.length;
  const fileLength = dataLength + 36;

  header.write("RIFF", 0);
  header.writeUInt32LE(fileLength, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataLength, 40);

  return Buffer.concat([header, pcmBuffer]);
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generatePageWithRetry(page: any, outputDir: string, attempt: number = 1): Promise<boolean> {
  const filename = `pagina${page.id}.mp3`;
  const outputPath = path.join(outputDir, filename);

  // Skip if already generated (prevents wasting low daily quota limits)
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
    console.log(`[Página ${page.id}] Áudio premium já existe em ${filename}. Pulando...`);
    return true;
  }

  let textToRead = "";
  if (page.title && page.type !== "cover") {
    textToRead += `${page.title}. `;
  }
  textToRead += page.paragraphs.join(" ");
  if (page.quote) {
    textToRead += ` Como diz a citação: "${page.quote}" de ${page.quoteAuthor || "Autor desconhecido"}.`;
  }

  console.log(`[Página ${page.id}] Gerando áudio premium para: "${textToRead.substring(0, 50)}..."`);

  try {
    const systemPrompt = "Você é um contador de histórias infantil brasileiro de voz mansa, acolhedora, expressiva e cativante. Leia o parágrafo a seguir de forma natural, respeitando pontuações e encenações de forma calma.";
    
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `${systemPrompt}\n\nTexto: ${textToRead}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("O modelo Gemini não retornou dados de áudio válidos.");
    }

    const pcmBuffer = Buffer.from(base64Audio, "base64");
    const wavBuffer = createWavBuffer(pcmBuffer, 24000);

    fs.writeFileSync(outputPath, wavBuffer);
    console.log(`[Página ${page.id}] Áudio premium gerado com sucesso: ${filename} (${wavBuffer.length} bytes)`);
    return true;
  } catch (error: any) {
    const errorString = JSON.stringify(error) || error.message || "";
    const isRateLimit = errorString.includes("429") || errorString.includes("quota") || errorString.includes("RESOURCE_EXHAUSTED");

    if (isRateLimit && attempt <= 5) {
      const waitTime = 65000; // Sleep for 65 seconds
      console.warn(`[Página ${page.id}] Limite de cota atingido (429). Aguardando ${waitTime / 1000}s antes da tentativa ${attempt + 1}...`);
      await sleep(waitTime);
      return generatePageWithRetry(page, outputDir, attempt + 1);
    } else {
      console.error(`[Página ${page.id}] Erro permanente ao gerar áudio:`, error.message || error);
      return false;
    }
  }
}

async function generateAll() {
  const outputDir = path.join(process.cwd(), "public", "audio");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Iniciando geração de áudio sequencial com rate-limiting de 12s...`);

  let count = 0;
  for (const page of bookPages) {
    const filename = `pagina${page.id}.mp3`;
    const outputPath = path.join(outputDir, filename);
    const alreadyExists = fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000;

    const success = await generatePageWithRetry(page, outputDir);
    
    // Only sleep if we actually made a request and it's not the last page
    if (!alreadyExists && success && page !== bookPages[bookPages.length - 1]) {
      const delay = 12000; // Sleep 12 seconds between requests to be extra safe
      console.log(`Aguardando ${delay / 1000}s para respeitar limites de cota...`);
      await sleep(delay);
    }
    if (success) count++;
  }

  console.log(`\nProcesso concluído! ${count}/${bookPages.length} áudios premium prontos.`);
}

generateAll();
