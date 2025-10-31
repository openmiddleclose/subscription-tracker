// src/pages/Signup.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  Link,
  useToast,
  Heading,
  Spinner,
  Image,
  Flex,
  useColorModeValue,
  keyframes,
  Checkbox,
  HStack,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import OAuthButton from "../components/OAuthButton"; // ✅ Import OAuthButton

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.700");
  const inputBg = useColorModeValue("gray.50", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const glowColor = useColorModeValue("blue.300", "blue.500");

  // 🔹 Logo glow animation
  const pulse = keyframes`
    0% { box-shadow: 0 0 0px ${glowColor}; }
    50% { box-shadow: 0 0 20px ${glowColor}; }
    100% { box-shadow: 0 0 0px ${glowColor}; }
  `;
  const animation = `${pulse} 2s infinite`;

  // 🔹 Check if user already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        navigate("/dashboard");
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [navigate]);

  // 🔹 Email/Password signup
  const handleSignup = async () => {
    if (!acceptedTerms) {
      toast({
        title: "Acceptance required",
        description: "You must accept the Terms and Policies to sign up.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      toast({
        title: "Signup successful!",
        description: "You can now log in to your account.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Signup failed",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Flex
        minH="100vh"
        justify="center"
        align="center"
        bg={useColorModeValue("gray.50", "gray.900")}
      >
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Flex
      minH="100vh"
      justify="center"
      align="center"
      bg={useColorModeValue("gray.50", "gray.900")}
      px={4}
    >
      <Box
        maxW={{ base: "90%", md: "400px" }}
        w="full"
        bg={cardBg}
        p={{ base: 6, md: 10 }}
        borderRadius="3xl"
        shadow="2xl"
        textAlign="center"
        transition="transform 0.3s ease, box-shadow 0.3s ease"
        _hover={{ transform: "translateY(-5px)", shadow: "3xl" }}
      >
        <VStack spacing={6}>
          {/* App Logo with glowing pulse */}
          <Box
            p={4}
            borderRadius="2xl"
            bg={useColorModeValue("blue.50", "blue.900")}
            animation={animation}
            transition="all 0.3s ease"
          >
            <Image
              src="/images/st-logo.png"
              alt="Subscription Tracker Logo"
              boxSize={{ base: "80px", md: "120px" }}
              objectFit="contain"
            />
          </Box>

          <Heading
            size={{ base: "md", md: "lg" }}
            color={useColorModeValue("blue.800", "blue.200")}
          >
            Sign Up
          </Heading>

          <VStack spacing={4} w="full">
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              bg={inputBg}
              borderRadius="lg"
              focusBorderColor="blue.400"
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              bg={inputBg}
              borderRadius="lg"
              focusBorderColor="blue.400"
            />

            {/* Terms and Policies Checkbox */}
            <Checkbox
              isChecked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              colorScheme="blue"
              alignItems="flex-start"
            >
              <HStack spacing={1}>
                <Text fontSize="sm" color={textColor}>
                  I accept the{" "}
                  <Link as={RouterLink} to="/terms" color="blue.500" fontWeight="semibold">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link as={RouterLink} to="/privacy" color="blue.500" fontWeight="semibold">
                    Privacy Policy
                  </Link>
                </Text>
              </HStack>
            </Checkbox>

            {/* Email/Password Signup */}
            <Button
              colorScheme="blue"
              width="100%"
              size="lg"
              fontWeight="bold"
              onClick={handleSignup}
              isLoading={submitting}
              isDisabled={!acceptedTerms}
              _hover={{
                boxShadow: `0 0 15px ${glowColor}`,
                transform: "scale(1.05)",
                bg: useColorModeValue("blue.500", "blue.600"),
              }}
              _active={{
                bg: useColorModeValue("blue.600", "blue.700"),
              }}
            >
              Sign Up
            </Button>

            {/* Divider */}
            <Text>OR</Text>

            {/* Google Signup using reusable component */}
            <OAuthButton
              provider="google"
              label="Sign up with Google"
              colorScheme="red"
              iconSrc="/images/google-icon.png"
            />
          </VStack>

          <Text fontSize="sm" color={textColor}>
            Already have an account?{" "}
            <Link as={RouterLink} to="/login" color="blue.500" fontWeight="semibold">
              Login
            </Link>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}
