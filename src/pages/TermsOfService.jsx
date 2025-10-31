// src/pages/TermsOfService.jsx
import React from "react";
import { Box, Heading, Text, VStack, Link, Flex, Button, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

export default function TermsOfService() {
  const bgPage = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const cardBg = useColorModeValue("white", "gray.700");

  return (
    <Flex minH="100vh" justify="center" align="flex-start" bg={bgPage} py={10} px={4}>
      <Box maxW="800px" w="full" bg={cardBg} p={8} borderRadius="2xl" shadow="lg">
        <VStack align="start" spacing={6}>
          <Heading size="lg">Terms of Service</Heading>

          <Text color={textColor}>
            Welcome to Subscription Tracker! By accessing or using our app, you agree to comply with and be bound by these Terms of Service.
          </Text>

          <Text color={textColor} fontWeight="bold">1. Account Creation</Text>
          <Text color={textColor}>
            You must provide accurate information when signing up. You are responsible for maintaining the confidentiality of your account credentials.
          </Text>

          <Text color={textColor} fontWeight="bold">2. Use of the Service</Text>
          <Text color={textColor}>
            Subscription Tracker is provided to help you manage your subscriptions. You agree not to misuse the service or attempt unauthorized access.
          </Text>

          <Text color={textColor} fontWeight="bold">3. Privacy</Text>
          <Text color={textColor}>
            Your personal data is protected according to our Privacy Policy. Please review it carefully.
          </Text>

          <Text color={textColor} fontWeight="bold">4. Limitations of Liability</Text>
          <Text color={textColor}>
            We are not liable for any losses, damages, or issues arising from the use of the app. Use at your own risk.
          </Text>

          <Text color={textColor} fontWeight="bold">5. Changes to Terms</Text>
          <Text color={textColor}>
            We may update these Terms from time to time. Continued use of the service indicates acceptance of the revised Terms.
          </Text>

          <Button as={RouterLink} to="/signup" colorScheme="blue">
            Back to Signup
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}
