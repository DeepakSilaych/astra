// Test script to verify API connections
import OpenAI from "openai";
import Replicate from "replicate";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function testOpenAI() {
  try {
    console.log("Testing OpenAI API...");
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Hello, this is a test. Please respond with 'API working'.",
        },
      ],
      max_tokens: 10,
    });
    console.log("✅ OpenAI API working:", response.choices[0].message.content);
    return true;
  } catch (error) {
    console.error("❌ OpenAI API error:", error.message);
    return false;
  }
}

async function testReplicate() {
  try {
    console.log("Testing Replicate API...");
    // Just test if we can authenticate and get model info
    const models = await replicate.models.list();
    console.log("✅ Replicate API working - authenticated successfully");
    return true;
  } catch (error) {
    console.error("❌ Replicate API error:", error.message);
    return false;
  }
}

export async function testAPIs() {
  console.log("🔍 Testing API connections...\n");

  const openaiWorking = await testOpenAI();
  const replicateWorking = await testReplicate();

  console.log("\n📊 API Status Summary:");
  console.log(`OpenAI: ${openaiWorking ? "✅ Working" : "❌ Failed"}`);
  console.log(`Replicate: ${replicateWorking ? "✅ Working" : "❌ Failed"}`);

  return { openaiWorking, replicateWorking };
}
