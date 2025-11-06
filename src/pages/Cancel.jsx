import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

export default function Cancel() {
  return (
    <Box p={8}>
      <Heading>Payment Canceled</Heading>
      <Text mt={4}>You canceled the checkout. Please try again if you wish to proceed.</Text>
    </Box>
  );
}
