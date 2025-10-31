import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  useColorModeValue,
  Image,
  Divider,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const TAX_RATE = 0.075;

const plans = [
  { id: 1, name: "Monthly", price: 10, description: "Perfect for trying out the app" },
  { id: 2, name: "Yearly", price: 100, description: "Best value for long-term use" },
];

export default function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();

  const bgPage = useColorModeValue("gray.50", "gray.900");
  const bgCard = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");

  const handleSelectPlan = (plan) => setSelectedPlan(plan);

  const calculateTax = (amount) => (amount * TAX_RATE).toFixed(2);
  const calculateTotal = (amount) => (amount + amount * TAX_RATE).toFixed(2);

  const handleCheckout = () => {
    if (!selectedPlan) return;
    // Pass plan info to StripeCheckout via state
    navigate("/stripe-checkout", { state: { plan: selectedPlan } });
  };

  return (
    <Box minH="100vh" p={{ base: 6, md: 12 }} bg={bgPage}>
      {/* Header with Logo */}
      <VStack spacing={4} mb={12} textAlign="center">
        <Box p={4} borderRadius="2xl" bg={useColorModeValue("blue.50", "blue.900")}>
          <Image
            src="/images/st-logo.png"
            alt="App Logo"
            boxSize={{ base: "60px", md: "80px" }}
            objectFit="contain"
          />
        </Box>
        <Heading size={{ base: "lg", md: "2xl" }}>Choose Your Subscription Plan</Heading>
        <Text fontSize="md" color={textColor}>
          Select a plan that fits your needs and proceed to checkout
        </Text>
      </VStack>

      {/* Subscription Plans */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        {plans.map((plan) => (
          <Box
            key={plan.id}
            bg={bgCard}
            shadow="lg"
            borderRadius="2xl"
            p={8}
            transition="transform 0.2s, box-shadow 0.2s"
            _hover={{ transform: "translateY(-5px)", shadow: "xl" }}
          >
            <VStack spacing={4} align="stretch">
              <Heading size="md" textAlign="center">{plan.name}</Heading>
              <Text fontSize="2xl" fontWeight="bold" textAlign="center">${plan.price}</Text>
              <Text fontSize="sm" color={textColor} textAlign="center">{plan.description}</Text>
              <Button colorScheme="orange" size="md" w="full" onClick={() => handleSelectPlan(plan)}>
                Select Plan
              </Button>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>

      {/* Subscription Summary */}
      {selectedPlan && (
        <Box
          mt={12}
          bg={bgCard}
          shadow="lg"
          borderRadius="2xl"
          p={8}
          maxW="600px"
          mx="auto"
          transition="opacity 0.3s"
        >
          <Heading size="md" mb={4} textAlign="center">Subscription Summary</Heading>
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
              <Text fontSize="lg" fontWeight="bold">Total:</Text>
              <Text fontSize="lg" fontWeight="bold">${calculateTotal(selectedPlan.price)}</Text>
            </HStack>
            <Button
              colorScheme="green"
              size="lg"
              mt={4}
              w="full"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
          </VStack>
        </Box>
      )}
    </Box>
  );
}
