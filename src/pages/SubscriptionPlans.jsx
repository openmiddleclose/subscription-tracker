import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Divider,
  useColorModeValue,
  useToast,
  Badge,
  Switch,
  useColorMode,
  SlideFade,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const TAX_RATE = 0.075;

const plansData = {
  Monthly: [
    { id: 1, name: "Monthly", price: 10, description: "Perfect for trying out the app" },
  ],
  Yearly: [
    { id: 2, name: "Yearly", price: 100, description: "Best value for long-term use" },
  ],
};

export default function SubscriptionPlans() {
  const [billing, setBilling] = useState("Monthly");
  const [plans, setPlans] = useState(plansData[billing]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userId, setUserId] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();
  const { colorMode } = useColorMode();

  const bgPage = useColorModeValue("gray.50", "gray.900");
  const bgCard = useColorModeValue("white", "gray.800");
  const selectedBorder = useColorModeValue("orange.400", "orange.300");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const paypalBg = useColorModeValue("gray.100", "gray.700");

  useEffect(() => {
    // Get currently logged in user
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setUserId(data.user.id);
      else alert("You must be logged in to subscribe.");
    };
    getUser();

    // Load PayPal SDK dynamically
    const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=CAD`;
    script.async = true;
    document.body.appendChild(script);

    return () => document.body.removeChild(script);
  }, []);

  useEffect(() => {
    setPlans(plansData[billing]);
    setSelectedPlan(null);
  }, [billing]);

  const handleSelectPlan = (plan) => setSelectedPlan(plan);
  const calculateTax = (amount) => (amount * TAX_RATE).toFixed(2);
  const calculateTotal = (amount) => (amount + amount * TAX_RATE).toFixed(2);

  // Render PayPal button
  useEffect(() => {
    if (!selectedPlan || !window.paypal || !userId) return;

    const containerId = `paypal-button-container-${selectedPlan.id}`;
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          color: "blue",
          shape: "pill",
          label: "pay",
          height: 45,
          tagline: false,
        },
        createOrder: (data, actions) =>
          actions.order.create({
            purchase_units: [{ amount: { value: calculateTotal(selectedPlan.price) } }],
          }),
        onApprove: async (data, actions) => {
          const details = await actions.order.capture();

          toast({
            title: "Payment Completed",
            description: `Transaction completed by ${details.payer.name.given_name}`,
            status: "success",
            duration: 4000,
            isClosable: true,
          });

          try {
            const { error } = await supabase
              .from("profiles")
              .update({ plan: selectedPlan.name })
              .eq("id", userId);

            if (error) throw error;

            toast({
              title: "Subscription Updated",
              description: `You are now on the ${selectedPlan.name} plan.`,
              status: "success",
              duration: 4000,
              isClosable: true,
            });

            setTimeout(() => navigate("/dashboard"), 2000);
          } catch (err) {
            console.error("Supabase update error:", err);
            toast({
              title: "Error Updating Plan",
              description: err.message,
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        },
      })
      .render(`#${containerId}`);
  }, [selectedPlan, userId]);

  return (
    <Box minH="100vh" p={{ base: 6, md: 12 }} bg={bgPage}>
      <VStack mb={12} spacing={6} align="center">
        <img src="/images/st-logo.png" alt="App Logo" style={{ width: 120, height: "auto" }} />
        <Heading size={{ base: "lg", md: "2xl" }} textAlign="center">
          Choose Your Subscription Plan
        </Heading>
        <Text fontSize="md" color={textColor} textAlign="center">
          Select a plan that fits your needs
        </Text>

        {/* Billing toggle */}
        <HStack mt={2}>
          <Text>Monthly</Text>
          <Switch
            isChecked={billing === "Yearly"}
            onChange={() => setBilling(billing === "Monthly" ? "Yearly" : "Monthly")}
            colorScheme="orange"
          />
          <Text>Yearly</Text>
        </HStack>
      </VStack>

      {/* Centered plan card */}
      <VStack spacing={8} align="center">
        {plans.map((plan) => (
          <SlideFade in key={plan.id} offsetY="20px" style={{ width: "100%", maxWidth: 400 }}>
            <Box
              bg={bgCard}
              shadow={selectedPlan?.id === plan.id ? "2xl" : "lg"}
              border={selectedPlan?.id === plan.id ? `2px solid ${selectedBorder}` : "none"}
              borderRadius="2xl"
              p={8}
              transition="all 0.3s"
              _hover={{ transform: "translateY(-5px)", shadow: "xl" }}
            >
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">{plan.name}</Heading>
                  {plan.name === "Yearly" && <Badge colorScheme="orange">Best Value</Badge>}
                </HStack>
                <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                  ${plan.price}
                </Text>
                <Text fontSize="sm" color={textColor} textAlign="center">
                  {plan.description}
                </Text>
                <Button
                  colorScheme="orange"
                  size="md"
                  w="full"
                  onClick={() => handleSelectPlan(plan)}
                >
                  {selectedPlan?.id === plan.id ? "Selected" : "Select Plan"}
                </Button>
              </VStack>
            </Box>
          </SlideFade>
        ))}
      </VStack>

      {/* Subscription summary with PayPal */}
      {selectedPlan && (
        <SlideFade in offsetY="20px">
          <Box
            mt={12}
            bg={bgCard}
            shadow="lg"
            borderRadius="2xl"
            p={8}
            maxW="600px"
            mx="auto"
            textAlign="center"
          >
            <Heading size="md" mb={4}>
              Subscription Summary
            </Heading>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text>Plan:</Text>
                <Text fontWeight="bold">{selectedPlan.name}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text>Price:</Text>
                <Text fontWeight="bold">${selectedPlan.price.toFixed(2)}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text>Tax ({(TAX_RATE * 100).toFixed(1)}%):</Text>
                <Text fontWeight="bold">${calculateTax(selectedPlan.price)}</Text>
              </HStack>
              <Divider />
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="bold">
                  Total:
                </Text>
                <Text fontSize="lg" fontWeight="bold">
                  ${calculateTotal(selectedPlan.price)}
                </Text>
              </HStack>

              {/* PayPal button wrapper */}
              <SlideFade in offsetY="10px" delay={0.1}>
                <Box
                  mt={6}
                  p={4}
                  borderRadius="2xl"
                  boxShadow="lg"
                  bg={paypalBg}
                  display="flex"
                  justifyContent="center"
                  maxW="300px"
                  mx="auto"
                  overflow="hidden" // ensures nothing peeks out
                >
                  <div
                    id={`paypal-button-container-${selectedPlan.id}`}
                    style={{
                      width: "100%",
                      maxWidth: "100%",
                      transform: "scale(0.95)",
                      transformOrigin: "center",
                    }}
                  />
                </Box>
              </SlideFade>
            </VStack>
          </Box>
        </SlideFade>
      )}
    </Box>
  );
}
