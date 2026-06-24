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

// Define globals for lamejs to prevent strict-mode ReferenceError in Node ESM
const g = global as any;
g.MPEGMode = {};
g.Lame = {};
g.BitStream = {};
g.Dither = {};
g.Header = {};
g.Version = {};
g.Presets = {};
g.ParameterHolder = {};
g.VbrMode = {};
g.ShortBlock = {};
g.QuantizePVT = {};
g.Takehiro = {};
g.JVBRPicture = {};
g.ScaleFac = {};
g.Encoder = {};
g.III_psy_ratio = {};
g.III_psy_const = {};
g.PsyModel = {};
g.VBRQueue = {};
g.VbrPVT = {};
g.Plot = {};
g.Tables = {};

let lamejsInstance: any = null;

function getLamejs() {
  if (!lamejsInstance) {
    const lamejsPath = path.join(process.cwd(), "node_modules", "lamejs", "lame.all.js");
    const code = fs.readFileSync(lamejsPath, "utf8");
    // Wrap and evaluate in non-strict mode to resolve LAME globals
    const fn = new Function("global", code + "\nreturn lamejs;");
    lamejsInstance = fn(global);
  }
  return lamejsInstance;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generatePageWithRetry(page: any, outputDir: string, attempt: number = 1): Promise<boolean> {
  const filename = `pagina${page.id}.mp3`;
  const outputPath = path.join(outputDir, filename);

  // Check if existing file is actually a WAV file (starts with "RIFF")
  let isWav = false;
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 4) {
    try {
      const fd = fs.openSync(outputPath, "r");
      const buffer = Buffer.alloc(4);
      fs.readSync(fd, buffer, 0, 4, 0);
      fs.closeSync(fd);
      if (buffer.toString("utf8") === "RIFF") {
        isWav = true;
      }
    } catch (err) {
      console.warn(`[Página ${page.id}] Falha ao verificar formato do arquivo existente:`, err);
    }
  }

  // Skip only if it's already generated and is a REAL MP3 (not a WAV)
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000 && !isWav) {
    console.log(`[Página ${page.id}] Áudio premium MP3 real já existe em ${filename}. Pulando...`);
    return true;
  }

  if (isWav) {
    console.log(`[Página ${page.id}] Arquivo anterior em formato WAV (fake MP3) detectado. Forçando regeração como MP3 real...`);
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
    
    // Encode the raw 16-bit mono 24kHz PCM buffer into standard MP3 using lamejs
    const lj = getLamejs();
    const mp3encoder = new lj.Mp3Encoder(1, 24000, 128); // 1 channel (mono), 24000Hz, 128kbps
    const samples = new Int16Array(
      pcmBuffer.buffer,
      pcmBuffer.byteOffset,
      pcmBuffer.length / 2
    );

    const mp3Data: Buffer[] = [];
    const mp3Tmp = mp3encoder.encodeBuffer(samples);
    if (mp3Tmp.length > 0) {
      mp3Data.push(Buffer.from(mp3Tmp));
    }
    const mp3Flush = mp3encoder.flush();
    if (mp3Flush.length > 0) {
      mp3Data.push(Buffer.from(mp3Flush));
    }

    const mp3Buffer = Buffer.concat(mp3Data);

    fs.writeFileSync(outputPath, mp3Buffer);
    console.log(`[Página ${page.id}] Áudio premium MP3 real gerado com sucesso: ${filename} (${mp3Buffer.length} bytes)`);
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
