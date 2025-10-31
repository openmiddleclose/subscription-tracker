// src/pages/BillingSuccess.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Box, Heading, Text, Spinner, Button, useToast } from "@chakra-ui/react";
import axios from "axios";

export default function BillingSuccess() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const verifySession = async () => {
      const sessionId = searchParams.get("session_id");

      if (!sessionId) {
        setMessage("No Stripe session ID provided.");
        setLoading(false);
        return;
      }

      try {
        // Call your backend to verify the Stripe session
        const response = await axios.get(
          `http://localhost:4242/api/verify-stripe-session?session_id=${sessionId}`
        );

        const { subscriptionStatus, metadata } = response.data;
        const userId = metadata?.userId;

        if (!userId) throw new Error("No user ID found in Stripe session metadata");

        if (subscriptionStatus === "active") {
          // Upgrade user plan in Supabase
          const { error } = await supabase
            .from("profiles")
            .update({ plan: "premium" })
            .eq("id", userId);

          if (error) throw error;

          setSuccess(true);
          setMessage("Your subscription is now active! You are upgraded to Premium.");
          toast({
            title: "Subscription upgraded",
            description: "You now have access to Premium features.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });

          // Redirect to dashboard after 3 seconds
          setTimeout(() => navigate("/dashboard"), 3000);
        } else {
          setSuccess(false);
          setMessage(
            `Subscription not active (status: ${subscriptionStatus}). Please contact support.`
          );
          toast({
            title: "Subscription inactive",
            description: `Subscription status: ${subscriptionStatus}`,
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error("Billing success error:", error);
        setSuccess(false);
        setMessage(
          error.response?.data?.error || error.message || "An unknown error occurred verifying your subscription."
        );
        toast({
          title: "Subscription verification failed",
          description: error.response?.data?.error || error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [searchParams, toast, navigate]);

  return (
    <Box textAlign="center" mt={20}>
      {loading ? (
        <>
          <Spinner size="xl" />
          <Text mt={4}>Verifying your subscription...</Text>
        </>
      ) : (
        <>
          <Heading mb={4}>{success ? "Success!" : "Oops!"}</Heading>
          <Text mb={6}>{message}</Text>
          {!success && (
            <Button colorScheme="blue" onClick={() => navigate("/subscriptions")}>
              Go Back to Subscriptions
            </Button>
          )}
        </>
      )}
    </Box>
  );
}
