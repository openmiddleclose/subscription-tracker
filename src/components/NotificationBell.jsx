import { Box, IconButton, Badge, VStack, Text } from "@chakra-ui/react";
import { BellIcon } from "@chakra-ui/icons";
import { useState } from "react";
import NotificationPanel from "./NotificationPanel";
import useNotifications from "../hooks/useNotifications";

export default function NotificationBell() {
  const notifications = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Box position="relative">
      <IconButton
        icon={<BellIcon />}
        aria-label="Notifications"
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        fontSize="24px"
      />
      {unreadCount > 0 && (
        <Badge
          position="absolute"
          top="-1"
          right="-1"
          colorScheme="red"
          borderRadius="full"
        >
          {unreadCount}
        </Badge>
      )}
      {isOpen && (
        <NotificationPanel notifications={notifications} onClose={() => setIsOpen(false)} />
      )}
    </Box>
  );
}
