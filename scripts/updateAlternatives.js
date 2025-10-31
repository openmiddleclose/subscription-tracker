// scripts/updateAlternatives.js
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import * as cheerio from "cheerio"; // kept for future scraping

// -----------------------------
// Load environment variables
// -----------------------------
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Supabase URL or Key is missing. Check your .env file.");
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  console.error("❌ OpenAI API key is missing. Check your .env file.");
  process.exit(1);
}

// -----------------------------
// Supabase & OpenAI clients
// -----------------------------
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// -----------------------------
// Live Scraping Examples (skipped for now)
// -----------------------------
async function fetchLiveAlternatives(category) {
  console.log(`⚠️ Skipping live scraping for category "${category}" (placeholder URL)`);
  return []; // return empty for now
}

// -----------------------------
// Generate AI Alternatives with fallback
// -----------------------------
async function generateAlternativesAI(subscription) {
  try {
    const prompt = `
      Suggest 3 cheaper subscription alternatives for a service in the category "${subscription.category}" 
      like "${subscription.name}" with provider, monthly price, features (as array), and URL.
      Return as JSON array.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const text = response.choices[0].message.content;
    let aiAlternatives = [];

    try {
      aiAlternatives = JSON.parse(text);
    } catch (err) {
      console.error("Failed to parse AI output, using fallback:", text);
    }

    // If parsing fails or API returns empty, use fallback
    if (!aiAlternatives || aiAlternatives.length === 0) {
      throw new Error("Empty AI response, using fallback");
    }

    return aiAlternatives.map((alt) => ({
      ...alt,
      created_at: new Date(),
      updated_at: new Date(),
    }));
  } catch (error) {
    console.warn(
      `OpenAI error: ${error.message}. Using mock AI alternatives instead.`
    );

    // Fallback mock alternatives
    const mockAlternatives = [
      {
        name: `${subscription.name} Lite`,
        category: subscription.category,
        amount: subscription.amount - 2,
        provider: `${subscription.name} Provider`,
        url: `https://example.com/${subscription.name.toLowerCase().replace(/\s/g, "-")}-lite`,
        features: ["Basic feature 1", "Basic feature 2"],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: `${subscription.name} Basic`,
        category: subscription.category,
        amount: subscription.amount - 1.5,
        provider: `${subscription.name} Provider`,
        url: `https://example.com/${subscription.name.toLowerCase().replace(/\s/g, "-")}-basic`,
        features: ["Feature A", "Feature B"],
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: `${subscription.name} Essential`,
        category: subscription.category,
        amount: subscription.amount - 1,
        provider: `${subscription.name} Provider`,
        url: `https://example.com/${subscription.name.toLowerCase().replace(/\s/g, "-")}-essential`,
        features: ["Feature X", "Feature Y"],
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    return mockAlternatives;
  }
}

// -----------------------------
// Upsert into Supabase
// -----------------------------
async function upsertAlternatives(alternatives) {
  for (const alt of alternatives) {
    const { error } = await supabase
      .from("subscription_alternatives")
      .upsert({
        name: alt.name,
        category: alt.category,
        amount: alt.amount,
        features: alt.features,
        url: alt.url,
        provider: alt.provider,
        created_at: alt.created_at,
        updated_at: alt.updated_at,
      });

    if (error) console.error("Upsert error:", error);
  }
}

// -----------------------------
// Fetch all subscriptions from Supabase
// -----------------------------
async function fetchSubscriptions() {
  const { data, error } = await supabase
    .from("subscriptions") // replace with your subscriptions table name
    .select("*");

  if (error) {
    console.error("Error fetching subscriptions:", error);
    return [];
  }

  return data || [];
}

// -----------------------------
// Main Script
// -----------------------------
async function main() {
  console.log("🔄 Updating subscription alternatives...");

  const currentSubs = await fetchSubscriptions();
  if (!currentSubs.length) {
    console.warn("⚠️ No subscriptions found in the database.");
    return;
  }

  for (const sub of currentSubs) {
    console.log(`\n📦 Processing: ${sub.name} (${sub.category})`);

    // 1️⃣ Live alternatives (skipped)
    const liveAlternatives = await fetchLiveAlternatives(sub.category);
    const cheaperLive = liveAlternatives.filter((alt) => alt.amount < sub.amount);

    // 2️⃣ AI alternatives (with fallback)
    const aiAlternatives = await generateAlternativesAI(sub);

    const allAlternatives = [...cheaperLive, ...aiAlternatives];
    console.log(`✅ Found ${allAlternatives.length} alternatives for ${sub.name}`);

    // 3️⃣ Upsert into Supabase
    await upsertAlternatives(allAlternatives);
  }

  console.log("\n🎉 All subscription alternatives updated successfully!");
}

main().catch((err) => console.error("Main error:", err));
