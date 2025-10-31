import { Box, VStack, HStack, Text, Button, Divider } from "@chakra-ui/react";
import { supabase } from "../supabaseClient";

export default function NotificationPanel({ notifications, onClose }) {
  const markAsRead = async (id) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  };

  return (
    <Box
      position="absolute"
      top="40px"
      right="0"
      w="300px"
      maxH="400px"
      overflowY="auto"
      bg="white"
      shadow="lg"
      rounded="md"
      zIndex={100}
    >
      <VStack align="stretch" spacing={0}>
        {notifications.length === 0 ? (
          <Text p={4} color="gray.500">No notifications</Text>
        ) : (
          notifications.map((n) => (
            <Box key={n.id} p={3} bg={n.is_read ? "gray.50" : "blue.50"}>
              <HStack justify="space-between">
                <Text fontSize="sm">{n.message}</Text>
                {!n.is_read && (
                  <Button size="xs" onClick={() => markAsRead(n.id)}>
                    Mark read
                  </Button>
                )}
              </HStack>
              <Divider mt={2} />
            </Box>
          ))
        )}
      </VStack>
    </Box>
  );
}
