// src/pages/PrivacyPolicy.jsx
import React from "react";
import { Box, Heading, Text, VStack, Flex, Button, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

export default function PrivacyPolicy() {
  const bgPage = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const cardBg = useColorModeValue("white", "gray.700");

  return (
    <Flex minH="100vh" justify="center" align="flex-start" bg={bgPage} py={10} px={4}>
      <Box maxW="800px" w="full" bg={cardBg} p={8} borderRadius="2xl" shadow="lg">
        <VStack align="start" spacing={6}>
          <Heading size="lg">Privacy Policy</Heading>

          <Text color={textColor}>
            Your privacy is important to us. This Privacy Policy outlines how we collect, use, and protect your data when using Subscription Tracker.
          </Text>

          <Text color={textColor} fontWeight="bold">1. Data Collection</Text>
          <Text color={textColor}>
            We collect email, password (hashed), subscription data, and payment information to provide the service.
          </Text>

          <Text color={textColor} fontWeight="bold">2. Use of Data</Text>
          <Text color={textColor}>
            Your data is used to manage subscriptions, send notifications, and improve the service.
          </Text>

          <Text color={textColor} fontWeight="bold">3. Data Security</Text>
          <Text color={textColor}>
            We implement industry-standard security measures to protect your data.
          </Text>

          <Text color={textColor} fontWeight="bold">4. Sharing Data</Text>
          <Text color={textColor}>
            We do not sell or share your personal information with third parties except as required by law.
          </Text>

          <Text color={textColor} fontWeight="bold">5. Changes to Policy</Text>
          <Text color={textColor}>
            We may update this Privacy Policy periodically. Continued use indicates acceptance of the changes.
          </Text>

          <Button as={RouterLink} to="/signup" colorScheme="blue">
            Back to Signup
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}
