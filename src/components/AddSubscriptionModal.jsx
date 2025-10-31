// src/components/AddSubscriptionModal.jsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { supabase } from "../supabaseClient";
import dayjs from "dayjs";

export default function AddSubscriptionModal({ isOpen, onClose, onAdded, editData, onUpgrade }) {
  const toast = useToast();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [customCurrency, setCustomCurrency] = useState("");
  const [billingCycle, setBillingCycle] = useState("Monthly");
  const [nextRenewalDate, setNextRenewalDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (editData) {
      setName(editData.name || "");
      setCategory(editData.category || "");
      setAmount(editData.amount || "");
      setCurrency(
        editData.currency || "USD"
      );
      setCustomCurrency(
        editData.currency && !predefinedCurrencies.some((c) => c.code === editData.currency)
          ? editData.currency
          : ""
      );
      setBillingCycle(editData.billing_cycle || "Monthly");
      setNextRenewalDate(
        editData.next_renewal_date ? dayjs(editData.next_renewal_date).format("YYYY-MM-DD") : ""
      );
      setNotes(editData.notes || "");
    } else {
      setName("");
      setCategory("");
      setAmount("");
      setCurrency("USD");
      setCustomCurrency("");
      setBillingCycle("Monthly");
      setNextRenewalDate("");
      setNotes("");
    }
  }, [editData, isOpen]);

  const handleSubmit = async () => {
    const finalCurrency = currency === "OTHER" ? customCurrency.trim() : currency;

    if (!name || !category || !amount || !billingCycle || !nextRenewalDate || !finalCurrency) {
      toast({ title: "Please fill in all required fields", status: "warning" });
      return;
    }

    setLoading(true);

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast({ title: "User not authenticated", description: userError?.message, status: "error" });
      setLoading(false);
      return;
    }

    // --- Free vs Premium enforcement ---
    if (!editData) {
      // Fetch user plan
      const { data: userData, error: userDataError } = await supabase
        .from("profiles") // or "users" table
        .select("plan")
        .eq("id", user.id)
        .single();

      if (userDataError || !userData) {
        toast({ title: "Failed to fetch user plan", status: "error" });
        setLoading(false);
        return;
      }

      // Fetch current subscriptions count
      const { data: subscriptions, error: subsError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id);

      if (subsError) {
        toast({ title: "Failed to fetch subscriptions", status: "error" });
        setLoading(false);
        return;
      }

      // Enforce free plan limit
      if (userData.plan === "free" && subscriptions.length >= 5) {
        toast({
          title: "Free plan limit reached",
          description: "Upgrade to Premium to add more subscriptions",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "top",
          render: () => (
            <div style={{ background: "white", padding: "16px", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.2)" }}>
              <strong>Free plan limit reached.</strong>
              <div>Upgrade to Premium to add more subscriptions.</div>
              <Button
                mt={2}
                colorScheme="blue"
                size="sm"
                onClick={() => {
                  if (onUpgrade) onUpgrade();
                  toast.closeAll();
                }}
              >
                Upgrade Now
              </Button>
            </div>
          ),
        });
        setLoading(false);
        return;
      }
    }
    // --- End enforcement ---

    const subscriptionData = {
      user_id: user.id,
      name,
      category,
      amount: parseFloat(amount),
      currency: finalCurrency,
      billing_cycle: billingCycle,
      next_renewal_date: nextRenewalDate,
      notes,
    };

    let error;
    if (editData) {
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update(subscriptionData)
        .eq("id", editData.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from("subscriptions").insert([subscriptionData]);
      error = insertError;
    }

    setLoading(false);

    if (error) {
      toast({ title: "Error saving subscription", description: error.message, status: "error" });
    } else {
      toast({ title: `Subscription ${editData ? "updated" : "added"} successfully`, status: "success" });
      onAdded();
      onClose();
    }
  };

  const predefinedCurrencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "AUD", symbol: "A$", name: "Australian Dollar" },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
    { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
    { code: "SEK", symbol: "kr", name: "Swedish Krona" },
    { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
    { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
    { code: "ZAR", symbol: "R", name: "South African Rand" },
    { code: "KRW", symbol: "₩", name: "South Korean Won" },
    { code: "BRL", symbol: "R$", name: "Brazilian Real" },
    { code: "MXN", symbol: "Mexican Peso", name: "Mexican Peso" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{editData ? "Edit Subscription" : "Add New Subscription"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Netflix, Spotify..." />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Category</FormLabel>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Entertainment, Music..." />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Amount</FormLabel>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="15.99"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Currency</FormLabel>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {predefinedCurrencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.symbol})
                  </option>
                ))}
                <option value="OTHER">Other</option>
              </Select>
            </FormControl>

            {currency === "OTHER" && (
              <FormControl isRequired>
                <FormLabel>Custom Currency Code / Symbol</FormLabel>
                <Input
                  value={customCurrency}
                  onChange={(e) => setCustomCurrency(e.target.value)}
                  placeholder="Enter currency code or symbol"
                />
              </FormControl>
            )}

            <FormControl isRequired>
              <FormLabel>Billing Cycle</FormLabel>
              <Select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)}>
                <option>Monthly</option>
                <option>Yearly</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Next Renewal Date</FormLabel>
              <Input type="date" value={nextRenewalDate} onChange={(e) => setNextRenewalDate(e.target.value)} />
            </FormControl>

            <FormControl>
              <FormLabel>Notes</FormLabel>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes..." />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
            {editData ? "Update" : "Add"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
