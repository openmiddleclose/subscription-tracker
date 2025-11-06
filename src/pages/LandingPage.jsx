// src/pages/LandingPage.jsx
import React from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Image,
  Stack,
  IconButton,
  useColorMode,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react"; // ✅ Correct import
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, blue.100)",
    "linear(to-br, gray.900, gray.800)"
  );
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");

  // Glow animation for logo
  const glow = keyframes`
    0%, 100% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.6); }
    50% { box-shadow: 0 0 25px rgba(59, 130, 246, 1); }
  `;

  return (
    <Box minH="100vh" bgGradient={bgGradient} px={4} position="relative">
      {/* Dark Mode Toggle */}
      <Flex position="absolute" top={4} right={4}>
        <IconButton
          aria-label="Toggle Dark Mode"
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          size="md"
          colorScheme="blue"
        />
      </Flex>

      {/* Center Card */}
      <Flex minH="100vh" align="center" justify="center">
        <VStack
          spacing={8}
          bg={cardBg}
          p={{ base: 6, md: 12 }}
          borderRadius="3xl"
          shadow="2xl"
          textAlign="center"
          maxW={{ base: "90%", md: "600px" }}
          w="full"
          transition="transform 0.3s ease, box-shadow 0.3s ease"
          _hover={{ transform: "translateY(-5px)", shadow: "3xl" }}
        >
          {/* Logo with square rounded background */}
          <Box
            p={6}
            borderRadius="2xl"
            bg={useColorModeValue("blue.50", "blue.900")}
            animation={`${glow} 2s ease-in-out infinite`}
            display="inline-block"
          >
            <Image
              src="/images/st-logo.png"
              alt="Subscription Tracker Logo"
              boxSize={{ base: "100px", md: "140px" }}
              objectFit="contain"
            />
          </Box>

          <Heading
            size={{ base: "lg", md: "2xl" }}
            fontWeight="extrabold"
            color={useColorModeValue("blue.800", "blue.200")}
          >
            Subscription Tracker
          </Heading>

          <Text
            fontSize={{ base: "sm", md: "md" }}
            color={textColor}
            lineHeight="taller"
          >
            Keep track of all your subscriptions in one place. Monitor spending, receive reminders for renewals, and never miss a payment again!
          </Text>

          <Stack direction={{ base: "column", md: "row" }} spacing={4}>
            <Button
              colorScheme="blue"
              size="lg"
              px={10}
              fontWeight="bold"
              _hover={{ bg: "blue.600", transform: "scale(1.05)" }}
              _active={{ bg: "blue.700" }}
              onClick={() => navigate("/signup")}
            >
              Launch App
            </Button>
            <Button
              variant="outline"
              colorScheme="blue"
              size="lg"
              px={10}
              fontWeight="bold"
              _hover={{
                bg: useColorModeValue("blue.50", "blue.800"),
                transform: "scale(1.05)",
              }}
              _active={{
                bg: useColorModeValue("blue.100", "blue.700"),
              }}
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          </Stack>
        </VStack>
      </Flex>
    </Box>
  );
}
