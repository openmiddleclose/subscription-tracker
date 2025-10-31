import React from "react";
import { Button, useToast } from "@chakra-ui/react";
import axios from "axios";

export default function StripeCheckout({ userId, email, plan }) {
  const toast = useToast();

  const handleCheckout = async () => {
    try {
      const { data } = await axios.post("http://localhost:4242/api/create-stripe-session", {
        userId,
        email,
        planId: plan.id,
      });

      if (data.url) {
        window.location.href = data.url; // Navigate to Stripe checkout
      }
    } catch (err) {
      console.error(err);
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
      Proceed to Stripe Checkout
    </Button>
  );
}
