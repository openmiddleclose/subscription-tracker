import React from "react";
import { Button, useToast } from "@chakra-ui/react";
import axios from "axios";

export default function StripeCheckout({ plan }) {
  const toast = useToast();

  const handleCheckout = async () => {
    try {
      const { data } = await axios.post("http://localhost:3001/create-checkout-session", {
        planName: plan.name,
        price: plan.price,
      });

      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error("Stripe checkout error:", err);
      toast({
        title: "Checkout failed",
        description: err.response?.data?.error || err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Button colorScheme="blue" onClick={handleCheckout}>
      Proceed to Checkout
    </Button>
  );
}
