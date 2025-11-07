// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  useToast,
  VStack,
  HStack,
  SimpleGrid,
  Divider,
  IconButton,
  Avatar,
  Input,
  Select,
  useColorMode,
  useColorModeValue,
  Spinner,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Badge,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiBell } from "react-icons/fi";
import { FaMoon, FaSun } from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "../supabaseClient";
import AddSubscriptionModal from "../components/AddSubscriptionModal";
import SubscriptionCard from "../components/SubscriptionCard";
import dayjs from "dayjs";

export default function Dashboard() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOption, setSortOption] = useState("name");
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [plan, setPlan] = useState("");

  const toast = useToast();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const bgCard = useColorModeValue("white", "gray.800");
  const bgPage = useColorModeValue("gray.50", "gray.900");

  // ------------------- Fetch & Realtime -------------------
  useEffect(() => {
    fetchProfile();
    fetchData();

    const subscriptionListener = supabase
      .channel("public:subscriptions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions" },
        (payload) => handleRealtimeSubscription(payload)
      )
      .subscribe();

    const profileListener = supabase
      .channel("public:profiles")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => handleRealtimePlan(payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscriptionListener);
      supabase.removeChannel(profileListener);
    };
  }, []);

  // ------------------- Fetch Functions -------------------
  const fetchProfile = async () => {
    setLoadingProfile(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate("/");

    const { data, error } = await supabase
      .from("profiles")
      .select("username, avatar_url, plan")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      toast({ title: "Error loading profile", status: "error" });
    } else {
      const userProfile = data || { username: user.email.split("@")[0], avatar_url: null, plan: "free" };
      setProfile(userProfile);
      setPlan(userProfile.plan || "free");
    }
    setLoadingProfile(false);
  };

  const fetchData = async () => {
    try {
      const { data: subsData, error: subsError } = await supabase.from("subscriptions").select("*");
      if (subsError) throw subsError;
      setSubscriptions(subsData || []);

      const { data: paymentsData, error: paymentsError } = await supabase.from("subscription_payments").select("*");
      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);

      updateSubscriptionNotifications(subsData || []);
    } catch (err) {
      toast({ title: "Error loading data", description: err.message, status: "error" });
    }
  };

  // ------------------- Realtime Handlers -------------------
  const handleRealtimeSubscription = (payload) => {
    const sub = payload.new || payload.old;
    fetchData();
    triggerSubscriptionNotification(sub);
  };

  const handleRealtimePlan = (payload) => {
    const newPlan = payload.new.plan;
    const oldPlan = payload.old.plan;
    if (newPlan !== oldPlan) {
      const notif = {
        id: `plan-${Date.now()}`,
        type: "Plan Changed",
        message: `Your subscription plan changed to ${newPlan.toUpperCase()}`,
        date: dayjs(),
        read: false,
      };
      setNotifications((prev) => [notif, ...prev]);
      setPlan(newPlan);
      toast({
        title: "Plan Updated",
        description: notif.message,
        status: "success",
        duration: 8000,
        isClosable: true,
      });
    }
  };

  // ------------------- Notifications -------------------
  const updateSubscriptionNotifications = (subs) => {
    const today = dayjs();
    const newNotifs = subs
      .map((sub) => {
        if (!sub.next_renewal_date) return null;
        const renewal = dayjs(sub.next_renewal_date);
        if (renewal.isBefore(today, "day")) return { id: sub.id, type: "Overdue", message: `${sub.name} is overdue!`, date: renewal, read: false };
        if (renewal.diff(today, "day") <= 3) return { id: sub.id, type: "Due Soon", message: `${sub.name} is due soon on ${renewal.format("MMM D")}`, date: renewal, read: false };
        return null;
      })
      .filter(Boolean);
    setNotifications((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      return [...newNotifs.filter((n) => !existingIds.has(n.id)), ...prev];
    });
  };

  const triggerSubscriptionNotification = (sub) => {
    const today = dayjs();
    if (!sub.next_renewal_date) return;
    const renewal = dayjs(sub.next_renewal_date);
    let type, message;
    if (renewal.isBefore(today, "day")) {
      type = "Overdue";
      message = `${sub.name} is overdue!`;
    } else if (renewal.diff(today, "day") <= 3) {
      type = "Due Soon";
      message = `${sub.name} is due soon on ${renewal.format("MMM D")}`;
    } else return;

    const notif = { id: sub.id, type, message, date: renewal, read: false };
    setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== sub.id)]);

    toast({
      title: type === "Overdue" ? "Overdue Subscription" : "Upcoming Renewal",
      description: message,
      status: type === "Overdue" ? "error" : "warning",
      duration: 8000,
      isClosable: true,
    });
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // ------------------- Filtered Subscriptions -------------------
  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        let status = "Upcoming";
        const today = dayjs();
        const renewalDate = sub.next_renewal_date ? dayjs(sub.next_renewal_date) : null;
        if (renewalDate) {
          if (renewalDate.isBefore(today, "day")) status = "Overdue";
          else if (renewalDate.diff(today, "day") <= 3) status = "Due Soon";
        }
        const matchesSearch = sub.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = filterCategory === "All" || sub.category === filterCategory;
        const matchesStatus = filterStatus === "All" || status === filterStatus;
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortOption === "amount") return (a.amount || 0) - (b.amount || 0);
        if (sortOption === "next_renewal_date") return new Date(a.next_renewal_date) - new Date(b.next_renewal_date);
        return a.name.localeCompare(b.name);
      });
  }, [subscriptions, search, filterCategory, filterStatus, sortOption]);

  const categories = ["All", ...Array.from(new Set(subscriptions.map((s) => s.category)))];
  const statuses = ["All", "Upcoming", "Due Soon", "Overdue"];
  const getStatusColor = (status) =>
    status === "Overdue" ? "red.400" : status === "Due Soon" ? "yellow.400" : "gray.400";

  // ------------------- Chart Data -------------------
  const categoryData = useMemo(() => {
    const counts = {};
    subscriptions.forEach((sub) => {
      counts[sub.category] = (counts[sub.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [subscriptions]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

  const monthlySpending = useMemo(() => {
    const data = {};
    subscriptions.forEach((sub) => {
      const month = dayjs(sub.next_renewal_date).format("MMM");
      data[month] = (data[month] || 0) + (sub.amount || 0);
    });
    return Object.entries(data).map(([month, total]) => ({ month, total }));
  }, [subscriptions]);

  return (
    <Box minH="100vh" bg={bgPage} p={{ base: 4, md: 8 }}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap">
        <HStack spacing={4} align="center">
          {loadingProfile ? (
            <Spinner size="sm" />
          ) : (
            <Avatar
              size="md"
              name={profile?.username || "User"}
              src={profile?.avatar_url || undefined}
              cursor="pointer"
              onClick={() => navigate("/profile")}
            />
          )}
          <Box>
            <Heading size="md" fontSize={{ base: "md", md: "lg" }}>
              Welcome back, {profile?.username || "User"} 👋
            </Heading>
            <Text fontSize={{ base: "xs", md: "sm" }} color={useColorModeValue("gray.500", "gray.300")}>
              Track your subscriptions effortlessly
            </Text>
            <Text fontSize="sm" color="orange.400" fontWeight="bold">
              Plan: {plan?.toUpperCase() || "FREE"}
            </Text>
          </Box>
        </HStack>

        <HStack spacing={2} mt={{ base: 3, md: 0 }}>
          <IconButton
            aria-label="Notifications"
            icon={<FiBell />}
            onClick={() => setIsNotifOpen(true)}
            position="relative"
            size="sm"
          >
            {notifications.filter((n) => !n.read).length > 0 && (
              <Badge
                colorScheme="red"
                borderRadius="full"
                position="absolute"
                top="-1"
                right="-1"
                fontSize="0.7em"
              >
                {notifications.filter((n) => !n.read).length}
              </Badge>
            )}
          </IconButton>

          <IconButton
            aria-label="Toggle Dark Mode"
            icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
            onClick={toggleColorMode}
            size="sm"
          />
          <Button
            leftIcon={<FiLogOut />}
            colorScheme="red"
            variant="outline"
            size="sm"
            onClick={() => supabase.auth.signOut().then(() => navigate("/"))}
          >
            Logout
          </Button>
        </HStack>
      </Flex>

      {/* Subscriptions Section */}
      <Box bg={bgCard} shadow="lg" borderRadius="2xl" p={4} w="100%">
        <Flex justify="space-between" mb={4} flexWrap="wrap">
          <Heading size="md" mb={{ base: 2, md: 0 }}>
            Active Subscriptions
          </Heading>
          <Wrap spacing={2} mb={{ base: 2, md: 0 }}>
            <WrapItem>
              <Button colorScheme="orange" size="sm" onClick={() => navigate("/subscriptions")}>
                Upgrade Plan
              </Button>
            </WrapItem>
            <WrapItem>
              <Button
                colorScheme="blue"
                size="sm"
                onClick={() => {
                  setEditData(null);
                  setIsModalOpen(true);
                }}
              >
                + Add
              </Button>
            </WrapItem>
            <WrapItem>
              <Button colorScheme="teal" size="sm" onClick={() => navigate("/savings")}>
                View Savings Recommendations
              </Button>
            </WrapItem>
          </Wrap>
        </Flex>

        <HStack mb={4} spacing={2} flexWrap="wrap">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            flex={{ base: 1, md: "auto" }}
            minW={{ base: "100%", md: "150px" }}
          />
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            flex={{ base: 1, md: "auto" }}
            minW={{ base: "100%", md: "120px" }}
          >
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </Select>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            flex={{ base: 1, md: "auto" }}
            minW={{ base: "100%", md: "120px" }}
          >
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
          <Select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            flex={{ base: 1, md: "auto" }}
            minW={{ base: "100%", md: "150px" }}
          >
            <option value="name">Sort by Name</option>
            <option value="amount">Sort by Amount</option>
            <option value="next_renewal_date">Sort by Renewal Date</option>
          </Select>
        </HStack>

        <VStack spacing={3} align="stretch">
          {filteredSubscriptions.map((sub) => {
            let status = "Upcoming";
            const today = dayjs();
            const renewalDate = sub.next_renewal_date ? dayjs(sub.next_renewal_date) : null;
            if (renewalDate) {
              if (renewalDate.isBefore(today, "day")) status = "Overdue";
              else if (renewalDate.diff(today, "day") <= 3) status = "Due Soon";
            }
            return (
              <SubscriptionCard
                key={sub.id}
                subscription={sub}
                onDelete={() => {}}
                onEdit={() => {}}
                borderColor={status === "Overdue" ? "red.400" : undefined}
                status={status}
                statusColor={getStatusColor(status)}
              />
            );
          })}
        </VStack>
      </Box>

      {/* Analytics Section */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={6}>
        <Box bg={bgCard} p={4} borderRadius="2xl" shadow="md">
          <Heading size="sm" mb={2}>
            Subscriptions by Category
          </Heading>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        <Box bg={bgCard} p={4} borderRadius="2xl" shadow="md">
          <Heading size="sm" mb={2}>
            Monthly Spending
          </Heading>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlySpending} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#3182CE" name="Amount" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </SimpleGrid>

      {/* Add Subscription Modal */}
      <AddSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdded={() => {}}
        editData={editData}
      />

      {/* Notifications Drawer */}
      <Drawer isOpen={isNotifOpen} placement="right" onClose={() => setIsNotifOpen(false)} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Notifications</DrawerHeader>
          <DrawerBody>
            <VStack spacing={3} align="stretch">
              {notifications.length === 0 ? (
                <Text>No notifications</Text>
              ) : (
                notifications.map((notif) => (
                  <Box
                    key={notif.id}
                    p={2}
                    borderRadius="md"
                    bg={notif.read ? bgPage : useColorModeValue("yellow.100", "yellow.700")}
                    onClick={() => markNotificationRead(notif.id)}
                    cursor="pointer"
                  >
                    <Text fontSize="sm" fontWeight="bold">
                      {notif.type}
                    </Text>
                    <Text fontSize="xs">{notif.message}</Text>
                  </Box>
                ))
              )}
              {notifications.length > 0 && (
                <Button mt={2} size="sm" onClick={markAllRead}>
                  Mark All as Read
                </Button>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
