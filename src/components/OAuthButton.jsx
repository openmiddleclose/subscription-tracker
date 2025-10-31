// src/components/OAuthButton.jsx
import React from "react";
import { Button, HStack, Image, Text, useColorModeValue } from "@chakra-ui/react";
import { supabase } from "../supabaseClient";

export default function OAuthButton({ provider, label, iconSrc, redirectTo = "/dashboard" }) {
  const bgColor = useColorModeValue("blue.600", "blue.400"); // blue for light/dark mode
  const hoverColor = useColorModeValue("blue.700", "blue.500"); // hover effect

  const handleOAuthLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin + redirectTo },
      });
      if (error) throw error;
    } catch (error) {
      alert(`${provider} login failed: ${error.message}`);
    }
  };

  return (
    <Button
      bg={bgColor}
      color="white"
      _hover={{ bg: hoverColor }}
      w="full"
      onClick={handleOAuthLogin}
    >
      <HStack justify="center" spacing={3}>
        {iconSrc && <Image src={iconSrc} boxSize="5" />}
        <Text fontWeight="semibold">{label}</Text>
      </HStack>
    </Button>
  );
}
