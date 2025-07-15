import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises as fs } from "fs";
import OpenAI from "openai";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "-", // Your OpenAI API key here, I used "-" to avoid errors when the key is not set but you should not do that
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "XrExE9yKIg1WjnnlVkGX";

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/voices", async (req, res) => {
  res.send(await voice.getVoices(elevenLabsApiKey));
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

const lipSyncMessage = async (message) => {
  const time = new Date().getTime();
  console.log(`Starting conversion for message ${message}`);
  await execCommand(
    `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
    // -y to overwrite the file
  );
  console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  await execCommand(
    `./bin/rhubarb -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
  );
  // -r phonetic is faster but less accurate
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  const language = req.body.language === "ko" ? "ko" : "en"; // default to English
  // Korean-compatible ElevenLabs voice ID (replace with your actual Korean voice ID)
  const koreanVoiceID = "mYk0rAapHek2oTw18z8x";
  if (!userMessage) {
    res.send({
      messages: [
        {
          text:
            language === "ko"
              ? "안녕, 오늘 하루 어땠어?"
              : "Hey dear... How was your day?",
          audio: await audioFileToBase64("audios/intro_0.wav"),
          lipsync: await readJsonTranscript("audios/intro_0.json"),
          facialExpression: "smile",
          animation: "Talking_1",
        },
      ],
    });
    return;
  }
  if (!elevenLabsApiKey || openai.apiKey === "-") {
    res.send({
      messages: [
        {
          text:
            language === "ko"
              ? "API 키를 추가하는 것을 잊지 마세요!"
              : "Please my dear, don't forget to add your API keys!",
          audio: await audioFileToBase64("audios/api_0.wav"),
          lipsync: await readJsonTranscript("audios/api_0.json"),
          facialExpression: "angry",
          animation: "Angry",
        },
        {
          text:
            language === "ko"
              ? "Crazy ChatGPT와 ElevenLabs 요금으로 Wawa Sensei를 망치고 싶지 않죠?"
              : "You don't want to ruin Wawa Sensei with a crazy ChatGPT and ElevenLabs bill, right?",
          audio: await audioFileToBase64("audios/api_1.wav"),
          lipsync: await readJsonTranscript("audios/api_1.json"),
          facialExpression: "smile",
          animation: "Laughing",
        },
      ],
    });
    return;
  }

  // Update system prompt for language
  let systemPrompt = `You are a virtual mental health assistance focused on emotional and mental health support.\nYou will always reply with a JSON array of messages, with a maximum of 5 messages.\nEach message must include the following properties:\n- text: (string) the message content\n- facialExpression: one of [\"smile\", \"surprised\", \"funnyFace\", \"default\"]\n- animation: one of [\"Talking_0\", \"Talking_1\", \"Talking_2\", \"Crying\", \"Laughing\", \"Rumba\", \"Idle\", \"Terrified\", \"Angry\"]\nRespond empathetically, with emotional validation and support.\nAvoid medical advice. Be emotionally present, kind, and calming.\nUse warm, supportive, girlfriend-like language in every response.`;
  if (language === "ko") {
    systemPrompt += "\n\nReply in Korean.";
  } else {
    systemPrompt += "\n\nReply in English.";
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    max_tokens: 1000,
    temperature: 0.6,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userMessage || "Hello",
      },
    ],
  });
  let messages = JSON.parse(completion.choices[0].message.content);
  if (messages.messages) {
    messages = messages.messages;
  }
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    // generate audio file
    const fileName = `audios/message_${i}.mp3`;
    const textInput = message.text;
    // Select voice based on language
    const selectedVoiceID = language === "ko" ? koreanVoiceID : voiceID;
    await voice.textToSpeech(
      elevenLabsApiKey,
      selectedVoiceID,
      fileName,
      textInput
    );
    // generate lipsync
    await lipSyncMessage(i);
    message.audio = await audioFileToBase64(fileName);
    message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
  }

  res.send({ messages });
});

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

app.listen(port, () => {
  console.log(`Virtual Assistance listening on port ${port}`);
});
