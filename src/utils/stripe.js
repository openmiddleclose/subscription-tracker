import axios from "axios";

/**
 * Triggers a Stripe checkout session and redirects user
 * @param {string} planName - Name of the subscription plan
 * @param {number} price - Plan price in USD
 * @param {string} userId - Supabase user ID
 */
export const startStripeCheckout = async (planName, price, userId) => {
  try {
    const { data } = await axios.post("http://localhost:3001/create-checkout-session", {
      planName,
      price,
      userId,
    });

    // Redirect user to Stripe checkout
    window.location.href = data.url;
  } catch (err) {
    console.error("Checkout error:", err);
    alert(err.response?.data?.error || err.message);
  }
};
