import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Setup path and environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Initialize app and Stripe
const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Health check
app.get("/ping", (req, res) => res.json({ ok: true }));

// 🔹 Create Stripe Checkout Session
app.post("/create-checkout-session", async (req, res) => {
  const { planName, price, userId } = req.body;

  if (!planName || !price || !userId) {
    return res.status(400).json({ error: "Missing plan info or userId" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: planName },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { userId, planName },
      success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/cancel`,
    });

    console.log("✅ Created Stripe session:", session.id);
    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Retrieve Stripe Checkout Session (used by Success Page)
app.get("/retrieve-checkout-session", async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) {
    return res.status(400).json({ error: "Missing session_id in query" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log("✅ Retrieved session:", session.id);

    // Send all necessary info back to frontend
    res.json({
      paymentStatus: session.payment_status,
      userId: session.metadata?.userId,
      planName: session.metadata?.planName,
      amountTotal: session.amount_total ? session.amount_total / 100 : null,
      currency: session.currency,
    });
  } catch (err) {
    console.error("❌ Retrieve session error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
