// src/components/SubscriptionCard.jsx
import React, { useState, useRef } from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  Button,
  Badge,
  useColorModeValue,
  Circle,
  Tooltip,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import dayjs from "dayjs";

export default function SubscriptionCard({ subscription, onEdit, onDelete, previousAmount }) {
  const { id, name, category, amount, billing_cycle, next_renewal_date } = subscription;

  const bg = useColorModeValue("gray.50", "gray.700");
  const border = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subTextColor = useColorModeValue("gray.500", "gray.300");

  // Parse date safely
  const today = dayjs();
  const renewalDate = next_renewal_date ? dayjs(next_renewal_date) : null;

  // Determine status
  let status = "N/A";
  if (renewalDate) {
    if (renewalDate.isBefore(today, "day")) status = "Overdue";
    else if (renewalDate.diff(today, "day") <= 3) status = "Due Soon";
    else status = "Upcoming";
  }

  const statusColorScheme = {
    "Upcoming": "green",
    "Due Soon": "yellow",
    "Overdue": "red",
    "N/A": "gray",
  }[status];

  const statusTooltip = {
    "Upcoming": "Renewal is in the future",
    "Due Soon": "Renewal due within 3 days",
    "Overdue": "Payment missed, overdue subscription",
    "N/A": "No renewal date set",
  }[status];

  // Determine trend (up/down)
  let trend = "";
  let trendColor = "";
  if (previousAmount !== undefined && amount !== undefined) {
    if (amount > previousAmount) {
      trend = "▲";
      trendColor = "green.400";
    } else if (amount < previousAmount) {
      trend = "▼";
      trendColor = "red.400";
    }
  }

  // AlertDialog for delete confirmation
  const [isOpen, setIsOpen] = useState(false);
  const cancelRef = useRef();

  const handleDeleteClick = () => setIsOpen(true);
  const handleConfirmDelete = () => {
    onDelete(id);
    setIsOpen(false);
  };

  return (
    <>
      <Box
        p={4}
        bg={bg}
        rounded="lg"
        border="2px solid"
        borderColor={status === "Overdue" ? "red.400" : border} // highlight overdue
        shadow="sm"
        _hover={{ shadow: "md", transform: "scale(1.01)", transition: "all 0.2s" }}
      >
        <HStack justify="space-between" align="start">
          {/* Left Section */}
          <VStack align="start" spacing={1}>
            <HStack spacing={2}>
              <Text fontWeight="bold" fontSize="lg" color={textColor}>
                {name || "Unnamed Subscription"}
              </Text>
              {renewalDate && (
                <Tooltip label={statusTooltip} fontSize="sm" placement="top">
                  <Circle size="10px" bg={`${statusColorScheme}.400`} />
                </Tooltip>
              )}
            </HStack>

            <Text color={subTextColor}>
              {category || "Uncategorized"} • {billing_cycle || "-"}
            </Text>

            <Text fontSize="sm" color={subTextColor}>
              Next Renewal: {renewalDate ? renewalDate.format("MMM D, YYYY") : "-"}
            </Text>

            <Tooltip label={statusTooltip} fontSize="sm" placement="top">
              <Badge
                colorScheme={statusColorScheme}
                variant="subtle"
                fontWeight="bold"
                px={2}
                py={1}
                mt={1}
              >
                {status}
              </Badge>
            </Tooltip>
          </VStack>

          {/* Right Section */}
          <VStack spacing={2} align="end">
            <HStack spacing={1}>
              <Text fontSize="md" fontWeight="bold" color="teal.600">
                ${amount ? amount.toFixed(2) : "0.00"}
              </Text>
              {trend && (
                <Text fontSize="md" fontWeight="bold" color={trendColor}>
                  {trend}
                </Text>
              )}
            </HStack>

            <HStack spacing={1}>
              <Button
                size="sm"
                colorScheme="yellow"
                variant="outline"
                onClick={() => onEdit(subscription)}
                aria-label={`Edit ${name}`}
              >
                Edit
              </Button>
              <Button
                size="sm"
                colorScheme="red"
                variant="outline"
                onClick={handleDeleteClick}
                aria-label={`Delete ${name}`}
              >
                Delete
              </Button>
            </HStack>
          </VStack>
        </HStack>
      </Box>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsOpen(false)}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Subscription
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
