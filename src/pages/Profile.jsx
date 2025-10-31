// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  Avatar,
  useToast,
  Spinner,
  useColorModeValue,
  IconButton,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FaArrowLeft, FaCamera } from "react-icons/fa";

export default function Profile() {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.700");
  const bg = useColorModeValue("gray.50", "gray.900");
  const inputBg = useColorModeValue("gray.50", "gray.800");

  // Load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          navigate("/login");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") throw error; // ignore "no row found"
        if (data) {
          setUsername(data.username || "");
          setAvatarUrl(data.avatar_url || "");
        }
      } catch (error) {
        toast({
          title: "Error loading profile",
          description: error.message,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, toast]);

  // Handle avatar upload
  const handleAvatarUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Avatar must be less than 5MB.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      setUploading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-avatar.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      // Update profile table
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, avatar_url: publicUrl, updated_at: new Date() });

      if (profileError) throw profileError;

      toast({
        title: "Avatar updated!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle profile save
  const handleSave = async () => {
    try {
      setSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          username,
          avatar_url: avatarUrl,
          updated_at: new Date(),
        });

      if (error) throw error;

      toast({
        title: "Profile updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg={bg}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bg} display="flex" alignItems="center" justifyContent="center" px={4}>
      <Box
        bg={cardBg}
        p={8}
        borderRadius="2xl"
        shadow="xl"
        maxW="md"
        w="full"
        textAlign="center"
        position="relative"
      >
        <IconButton
          icon={<FaArrowLeft />}
          aria-label="Back"
          variant="ghost"
          position="absolute"
          top={4}
          left={4}
          onClick={() => navigate("/dashboard")}
        />

        <VStack spacing={6}>
          <Heading size="lg">My Profile</Heading>

          {/* Avatar */}
          <Box position="relative">
            <Avatar
              size="2xl"
              src={avatarUrl || "/images/default-avatar.png"}
              name={username}
              border="3px solid"
              borderColor="blue.400"
            />
            <label>
              <IconButton
                as="span"
                icon={<FaCamera />}
                aria-label="Upload avatar"
                position="absolute"
                bottom={0}
                right={0}
                size="sm"
                colorScheme="blue"
                rounded="full"
                isLoading={uploading}
              />
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                display="none"
              />
            </label>
          </Box>

          {/* Username */}
          <VStack w="full" spacing={2}>
            <Text fontWeight="semibold" color="gray.500" alignSelf="flex-start">
              Username
            </Text>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              bg={inputBg}
              borderRadius="lg"
              focusBorderColor="blue.400"
            />
          </VStack>

          {/* Save Button */}
          <Button
            colorScheme="blue"
            w="full"
            size="lg"
            onClick={handleSave}
            isLoading={saving}
          >
            Save Changes
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
