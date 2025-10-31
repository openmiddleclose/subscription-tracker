import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useToast } from "@chakra-ui/react";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const toast = useToast();

  useEffect(() => {
    let subscription;

    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch existing notifications
      const { data: existing } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setNotifications(existing || []);

      // Real-time subscription
      subscription = supabase
        .channel(`notifications-user-${user.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          (payload) => {
            setNotifications((prev) => [payload.new, ...prev]);
            toast({
              title: "New Notification",
              description: payload.new.message,
              status: "info",
              duration: 5000,
              isClosable: true,
            });
          }
        )
        .subscribe();
    };

    fetchNotifications();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [toast]);

  return notifications;
}
