import React, { useEffect, useState } from "react";
import { Box, VStack, Heading, Text, useColorModeValue } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import StripeCheckout from "../components/StripeCheckout";
import { supabase } from "../supabaseClient";

export default function StripeCheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const plan = location.state?.plan;

  const [user, setUser] = useState(null);
  const bgPage = useColorModeValue("gray.50", "gray.900");
  const bgCard = useColorModeValue("white", "gray.800");

  useEffect(() => {
    if (!plan) navigate("/subscriptions");

    supabase.auth.getUser().then(res => setUser(res.data.user));
  }, [plan, navigate]);

  if (!plan || !user) return null;

  return (
    <Box minH="100vh" p={{ base: 6, md: 12 }} bg={bgPage}>
      <VStack spacing={6} maxW="500px" mx="auto" bg={bgCard} p={8} borderRadius="2xl" shadow="lg">
        <Heading size="lg">Stripe Checkout</Heading>
        <Text>Plan: {plan.name} - ${plan.price.toFixed(2)}</Text>
        <Text>Total (with tax): ${(plan.price * 1.075).toFixed(2)}</Text>

        <StripeCheckout userId={user.id} email={user.email} plan={plan} />
      </VStack>
    </Box>
  );
}
