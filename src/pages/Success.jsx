import React, { useEffect, useState } from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import axios from "axios";

export default function Success() {
  const location = useLocation();
  const [session, setSession] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get("session_id");

    if (sessionId) {
      axios
        .get(`http://localhost:3001/retrieve-checkout-session?sessionId=${sessionId}`)
        .then(res => setSession(res.data))
        .catch(err => console.error(err));
    }
  }, [location]);

  return (
    <Box p={8}>
      <Heading>Payment Successful!</Heading>
      {session ? (
        <Text mt={4}>Thank you for your payment of ${session.amount_total / 100} USD.</Text>
      ) : (
        <Text mt={4}>Loading payment details...</Text>
      )}
    </Box>
  );
}
