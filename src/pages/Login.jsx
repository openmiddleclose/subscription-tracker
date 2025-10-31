// src/pages/Login.jsx
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
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import OAuthButton from "../components/OAuthButton"; // ✅ Import OAuthButton

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);
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
  const logoAnimation = `${pulse} 2s infinite`;

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

  // 🔹 Email/Password login
  const handleLogin = async () => {
    try {
      setSubmitting(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      toast({
        title: "Login successful!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 🔹 Forgot Password handler
  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        title: "Enter your email first",
        description: "Please type your email before requesting a reset link.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    try {
      setResetting(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;

      toast({
        title: "Password reset email sent",
        description: "Check your inbox for the reset link.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Reset failed",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <Flex minH="100vh" justify="center" align="center" bg={useColorModeValue("gray.50", "gray.900")}>
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
        <VStack spacing={6} w="full">
          {/* Logo */}
          <Box
            p={4}
            borderRadius="2xl"
            bg={useColorModeValue("blue.50", "blue.900")}
            animation={logoAnimation}
          >
            <Image
              src="/images/st-logo.png"
              alt="App Logo"
              boxSize={{ base: "80px", md: "120px" }}
              objectFit="contain"
            />
          </Box>

          <Heading
            size={{ base: "md", md: "lg" }}
            color={useColorModeValue("blue.800", "blue.200")}
          >
            Login
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
              w="full"
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              bg={inputBg}
              borderRadius="lg"
              focusBorderColor="blue.400"
              w="full"
            />

            {/* Forgot Password Link */}
            <Flex justify="flex-end" w="full">
              <Link
                color="blue.500"
                fontSize="sm"
                fontWeight="semibold"
                onClick={handlePasswordReset}
                _hover={{ textDecoration: "underline" }}
              >
                {resetting ? "Sending..." : "Forgot Password?"}
              </Link>
            </Flex>

            {/* Email/Password Login */}
            <Button
              colorScheme="blue"
              size="lg"
              fontWeight="bold"
              w="full"
              onClick={handleLogin}
              isLoading={submitting}
              _hover={{
                boxShadow: `0 0 15px ${glowColor}`,
                transform: "scale(1.05)",
                bg: useColorModeValue("blue.500", "blue.600"),
              }}
              _active={{
                bg: useColorModeValue("blue.600", "blue.700"),
              }}
            >
              Login
            </Button>

            {/* Divider */}
            <Text>OR</Text>

            {/* Google Login using reusable component */}
            <OAuthButton
              provider="google"
              label="Continue with Google"
              colorScheme="red"
              iconSrc="/images/google-icon.png"
            />
          </VStack>

          {/* Terms notice under login button */}
          <Text fontSize="xs" color={textColor} mt={2}>
            By logging in, you agree to our{" "}
            <Link as={RouterLink} to="/terms" color="blue.500" fontWeight="semibold">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link as={RouterLink} to="/privacy" color="blue.500" fontWeight="semibold">
              Privacy Policy
            </Link>
            .
          </Text>

          <Text fontSize="sm" color={textColor}>
            Don’t have an account?{" "}
            <Link as={RouterLink} to="/signup" color="blue.500" fontWeight="semibold">
              Sign up
            </Link>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}
