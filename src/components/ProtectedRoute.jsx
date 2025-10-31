// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Spinner, Flex } from "@chakra-ui/react";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Auth check error:", error.message);
        setUser(null);
      } else {
        setUser(data?.user || null);
      }

      setLoading(false);
    };

    checkUser();

    // 🔹 Real-time listener for sign-in / sign-out events
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  // 🔹 Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
