import { openai } from "@/configs/openai";
import { functions } from "@/lib/functions";

export default async function handler(req, res) {
  const { messages } = req.body; // expects full chat history as array

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_API_MODEL || "gpt-4-0613",
      messages,
      functions,
      function_call: "auto",
    });

    const message = response.choices[0].message;

    // Function Call Detected
    if (message.tool_calls) {
      const { name, arguments: args } = message.function_call;
      return res.status(200).json({
        status: "function_call",
        intent: name,
        parameters: JSON.parse(args),
      });
    }

    // GPT has a natural language reply (e.g., asking for missing info)
    return res.status(200).json({
      status: "reply",
      reply: message.content,
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return res.status(500).json({ error: "Something went wrong with OpenAI" });
  }
}
