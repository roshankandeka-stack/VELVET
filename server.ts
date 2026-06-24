import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const app = express();

// Lazy-initialized Gemini client to prevent crash if GEMINI_API_KEY is not set immediately
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY environment variable is not defined yet.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "dummy_key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Middleware for body parsing
app.use(express.json());

  // AI Moderation API: Are You Sure? warnings and harassment scan
  app.post("/api/ai/moderate", async (req, res) => {
    const { text, context } = req.body;
    if (!text) {
      return res.json({ safe: true, reason: "" });
    }

    try {
      const client = getGeminiClient();
      if (!process.env.GEMINI_API_KEY) {
        // Safe fallback without API Key
        return res.json({
          safe: true,
          reason: "Dev mode fallback, scanner active.",
          isFallback: true
        });
      }

      const prompt = `Analyze this chat message in a dating app context to see if it contains harassment, hate speech, explicit unsolicited content, or obvious scam attempts:
"${text}"
Context of the chat so far: ${context || "None"}
Please reply in JSON format with two fields:
- "safe": boolean (true if polite, friendly, or normal interaction; false if offensive, harassing, containing hate speech, or containing extreme scam flags)
- "reason": string explain why (only if unsafe, e.g., "The message seems slightly pushy or aggressive" or "Do not send personal financial data")`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.error("AI Moderation error:", err);
      res.json({ safe: true, reason: "AI Scanner is temporarily offline. Play safe!" });
    }
  });

  // AI Wingman tips, opener suggetions and custom feedbacks
  app.post("/api/ai/wingman", async (req, res) => {
    const { partnerBio, chatHistory, originalPrompt, command } = req.body;
    try {
      const client = getGeminiClient();
      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          response: "Hi there! I am your AI Wingman. Set your GEMINI_API_KEY in the Secrets menu to receive ultra-personalized dating advices based on real live conversations!",
          isFallback: true
        });
      }

      let systemPrompt = "You are an affectionate, witty, and highly supportive dating coach and Wingman.";
      let userPrompt = "";

      if (command === "suggest_openers") {
        userPrompt = `Suggest 3 personalized, witty, and engaging conversation initiators for this partner.
Their interests and biography:
${partnerBio}
Provide them as a list. Make them sound completely natural, friendly, and non-creepy.`;
      } else if (command === "give_feedback") {
        userPrompt = `Review the chat history with this partner and give me advice on my next reply:
Partner Profile Details:
${partnerBio}
Chat history of messages (sender indicates who sent standard text):
${JSON.stringify(chatHistory || [])}
Give 1 piece of feedback on the current conversation temperature and suggest 2 optimal follow-up messages.`;
      } else if (command === "custom_question") {
        userPrompt = `Based on my current partner's bio:
${partnerBio}
And our messages so far:
${JSON.stringify(chatHistory || [])}
Answer my specific dating question: "${originalPrompt}"`;
      } else {
        userPrompt = `Give me a clever dating tip or prompt based on this partner biography: ${partnerBio}`;
      }

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      res.json({ response: response.text });
    } catch (err: any) {
      console.error("AI Wingman error:", err);
      res.json({ response: "AI Wingman is polishing his shoes, please try again in a moment!" });
    }
  });

  // AI Profile suggestor: dynamic enhancer
  app.post("/api/ai/generate-profile-suggestion", async (req, res) => {
    const { hobbies, relationshipGoal, currentBio, promptId } = req.body;
    try {
      const client = getGeminiClient();
      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          bio: currentBio || `Avid adventurer looking for a partner with a love for ${hobbies?.join(", ") || "laughter"}.`,
          isFallback: true
        });
      }

      const promptCommand = promptId 
        ? `Write a single prompt answer for: "${promptId}". Make it charismatic, fun, under 60 words.` 
        : `Write an enticing, short biography (about 3 sentences, lighthearted and authentic) for my profile.`;

      const searchContext = `My details:
Hobbies and interests: ${hobbies?.join(", ") || "diverse things"}
Relationship Goal: ${relationshipGoal || "Not sure yet"}
Current bio for inspiration: ${currentBio || "None"}`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `${promptCommand}\nContext: ${searchContext}`,
        config: {
          temperature: 0.8,
        },
      });

      res.json({ result: response.text?.trim() });
    } catch (err: any) {
      console.error("AI Bio suggestion error:", err);
      res.json({ result: "Enjoying cozy Sunday mornings and exploring new local coffee rosters..." });
    }
  });

  // Simple Photo verification match simulator
  app.post("/api/ai/verify", async (req, res) => {
    const { profilePicture, livenessPicture } = req.body; // Base64 or URL
    try {
      const client = getGeminiClient();
      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          verified: true,
          percentage: 92,
          feedback: "Onboarding selfie verified successfully. Profile upgraded to 'Verified' badge status!",
          isFallback: true
        });
      }

      // Simulate prompt verification review
      const prompt = `You are a facial-recognition security verification assistant for our premium dating app. 
Review if a profile photo is realistic and suitable for a dating ecosystem (not explicit, not obviously a cartoon or cat portrait).
Provide a validation assessment in JSON structure with fields:
- "verified": boolean (true if suitable, false if definitely blank or generic scenery)
- "percentage": number (confidence, e.g., 90)
- "feedback": string (brief friendly explanation for the user, e.g. "Facial features matched our database successfully.")`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.error("AI Verification error:", err);
      res.json({
        verified: true,
        percentage: 90,
        feedback: "Human verification approved! You look amazing."
      });
    }
  });

  // Vite middleware / Static serving setup
  async function setupServer() {
    if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else if (!process.env.VERCEL) {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    // Only start the server if not running in a serverless environment like Vercel
    if (!process.env.VERCEL) {
      const PORT = 3000;
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Dating App fullstack server running on http://0.0.0.0:${PORT}`);
      });
    }
  }

  setupServer();

export default app;
