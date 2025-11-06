import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  Box,
  VStack,
  Spinner,
  Text,
  Heading,
  Button,
  useToast,
} from "@chakra-ui/react";

export default function BillingSuccess() {
  const location = useLocation();
  const toast = useToast();

  const [status, setStatus] = useState("loading");
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setStatus("error");
      toast({
        title: "Verification failed",
        description: "Missing session_id in redirect URL.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    // Fetch verification data from backend
    axios
      .get(`http://localhost:3001/retrieve-checkout-session?session_id=${sessionId}`)
      .then((res) => {
        const data = res.data;
        console.log("✅ Verification response:", data);

        if (data.paymentStatus === "paid") {
          setStatus("success");
          setSessionData(data);

          toast({
            title: "Payment Verified ✅",
            description: "Your plan has been upgraded successfully!",
            status: "success",
            duration: 4000,
            isClosable: true,
          });
        } else {
          setStatus("unpaid");
          toast({
            title: "Payment not completed",
            description: "Your payment could not be confirmed.",
            status: "warning",
            duration: 4000,
            isClosable: true,
          });
        }
      })
      .catch((err) => {
        console.error("❌ Verification failed:", err);
        setStatus("error");
        toast({
          title: "Verification failed",
          description: "Could not verify payment session.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      });
  }, [location.search, toast]);

  const handleGoDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <Box p={10} textAlign="center">
      {status === "loading" && (
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text fontSize="lg" color="gray.500">
            Verifying your payment...
          </Text>
        </VStack>
      )}

      {status === "success" && sessionData && (
        <VStack spacing={5}>
          <Heading color="green.400">✅ Payment Successful!</Heading>
          <Text fontSize="lg">
            You have successfully upgraded to{" "}
            <b>{sessionData.planName || "Premium Plan"}</b>.
          </Text>
          <Text>
            Amount Paid:{" "}
            <b>
              {sessionData.amountTotal} {sessionData.currency?.toUpperCase()}
            </b>
          </Text>
          <Text fontSize="sm" color="gray.500">
            User ID: {sessionData.userId}
          </Text>
          <Button colorScheme="blue" onClick={handleGoDashboard}>
            Go to Dashboard
          </Button>
        </VStack>
      )}

      {status === "unpaid" && (
        <VStack spacing={3}>
          <Heading color="orange.400">⚠️ Payment Incomplete</Heading>
          <Text>Please try again or contact support if you were charged.</Text>
          <Button colorScheme="blue" onClick={() => (window.location.href = "/billing")}>
            Return to Billing
          </Button>
        </VStack>
      )}

      {status === "error" && (
        <VStack spacing={3}>
          <Heading color="red.400">❌ Verification Failed</Heading>
          <Text>
            We couldn’t verify your payment. Please refresh this page or contact
            support.
          </Text>
          <Button colorScheme="red" onClick={() => (window.location.href = "/billing")}>
            Try Again
          </Button>
        </VStack>
      )}
    </Box>
  );
}
