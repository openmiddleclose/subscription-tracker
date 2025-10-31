import React, { useState } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  Heading,
  Image,
  InputGroup,
  InputRightElement,
  useToast,
  useColorModeValue,
  ScaleFade,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");

  const handleResetPassword = async () => {
    if (!password || !confirm) {
      toast({
        title: "Missing fields",
        description: "Please fill in both password fields.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (password !== confirm) {
      toast({
        title: "Passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setSubmitting(true);

      // 🔹 Supabase automatically includes access token from email link
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast({
        title: "Password updated successfully",
        description: "You can now log in with your new password.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      navigate("/login");
    } catch (error) {
      toast({
        title: "Reset failed",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      bg={bg}
      minH="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      px={4}
    >
      <ScaleFade initialScale={0.9} in={true}>
        <VStack
          bg={cardBg}
          spacing={6}
          p={10}
          rounded="2xl"
          shadow="xl"
          w={{ base: "90%", sm: "400px" }}
        >
          <Image
            src="/images/st-logo.png"
            alt="App Logo"
            boxSize="80px"
            objectFit="contain"
          />
          <Heading size="lg" color={textColor}>
            Reset Your Password
          </Heading>
          <Text color="gray.500" fontSize="sm" textAlign="center">
            Enter a new password below to regain access to your account.
          </Text>

          <VStack spacing={4} w="full">
            <InputGroup size="lg">
              <Input
                placeholder="New Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                borderRadius="md"
              />
              <InputRightElement>
                <Button
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  size="sm"
                >
                  {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>

            <Input
              placeholder="Confirm New Password"
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              size="lg"
              borderRadius="md"
            />

            <Button
              colorScheme="blue"
              size="lg"
              width="full"
              onClick={handleResetPassword}
              isLoading={submitting}
              borderRadius="md"
            >
              Update Password
            </Button>
          </VStack>

          <Text fontSize="sm" color={textColor}>
            Remembered your password?{" "}
            <Button
              variant="link"
              colorScheme="blue"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </Button>
          </Text>
        </VStack>
      </ScaleFade>
    </Box>
  );
}
