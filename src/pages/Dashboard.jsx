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
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiBell, FiCheck } from "react-icons/fi";
import { FaMoon, FaSun } from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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
  const notifText = useColorModeValue("gray.700", "gray.100");

  // ------------------- Data Fetch & Realtime -------------------
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

  // ------------------- Actions -------------------
  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };
  const handleDelete = async (id) => {
    const { error } = await supabase.from("subscriptions").delete().eq("id", id);
    if (error) toast({ title: "Error deleting subscription", status: "error" });
    else { toast({ title: "Subscription deleted", status: "success" }); fetchData(); }
  };
  const handleEdit = (sub) => { setEditData(sub); setIsModalOpen(true); };

  const getPaymentsForSub = (subId) =>
    payments.filter((p) => p.subscription_id === subId).sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date));

  const getPreviousAmount = (sub) => {
    const subPayments = getPaymentsForSub(sub.id);
    if (subPayments.length > 1) return subPayments[subPayments.length - 2].amount;
    if (subPayments.length === 1) return sub.amount;
    return undefined;
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
  }, [subscriptions, search, filterCategory, filterStatus, sortOption, payments]);

  // ------------------- Analytics -------------------
  const categoryTotals = payments.reduce((acc, p) => {
    const sub = subscriptions.find((s) => s.id === p.subscription_id);
    const category = sub?.category || "Other";
    acc[category] = (acc[category] || 0) + parseFloat(p.amount);
    return acc;
  }, {});
  const totalSpent = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
  const pieData = Object.keys(categoryTotals).map((cat) => ({ name: cat, value: categoryTotals[cat], percent: ((categoryTotals[cat] / totalSpent) * 100).toFixed(1) }));
  const COLORS = ["#3182CE", "#2F855A", "#DD6B20", "#805AD5", "#E53E3E", "#38B2AC"];
  const monthlyCategoryTotals = {};
  payments.forEach((p) => {
    const month = dayjs(p.payment_date).format("YYYY-MM");
    const sub = subscriptions.find((s) => s.id === p.subscription_id);
    const category = sub?.category || "Other";
    if (!monthlyCategoryTotals[month]) monthlyCategoryTotals[month] = {};
    monthlyCategoryTotals[month][category] = (monthlyCategoryTotals[month][category] || 0) + parseFloat(p.amount);
  });
  const stackedBarData = Object.keys(monthlyCategoryTotals).sort().map((month) => ({ month, ...monthlyCategoryTotals[month] }));

  const categories = ["All", ...Array.from(new Set(subscriptions.map((s) => s.category)))];
  const statuses = ["All", "Upcoming", "Due Soon", "Overdue"];
  const getStatusColor = (status) => status === "Overdue" ? "red.400" : status === "Due Soon" ? "yellow.400" : "gray.400";

  // ------------------- Render -------------------
  return (
    <Box minH="100vh" bg={bgPage} p={{ base: 4, md: 8 }}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap">
        <HStack spacing={4} align="center">
          {loadingProfile ? <Spinner size="sm" /> :
            <Avatar size="md" name={profile?.username || "User"} src={profile?.avatar_url || undefined} cursor="pointer" onClick={() => navigate("/profile")} />
          }
          <Box>
            <Heading size="md">Welcome back, {profile?.username || "User"} 👋</Heading>
            <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.300")}>Track your subscriptions effortlessly</Text>
            <Text fontSize="sm" color="orange.400" fontWeight="bold">Plan: {plan?.toUpperCase() || "FREE"}</Text>
          </Box>
        </HStack>

        <HStack spacing={3} mt={{ base: 3, md: 0 }}>
          <IconButton aria-label="Notifications" icon={<FiBell />} onClick={() => setIsNotifOpen(true)} position="relative">
            {notifications.filter(n => !n.read).length > 0 && (
              <Badge colorScheme="red" borderRadius="full" position="absolute" top="-2" right="-2">
                {notifications.filter(n => !n.read).length}
              </Badge>
            )}
          </IconButton>

          <IconButton aria-label="Toggle Dark Mode" icon={colorMode === "light" ? <FaMoon /> : <FaSun />} onClick={toggleColorMode} />
          <Button leftIcon={<FiLogOut />} colorScheme="red" variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
        </HStack>
      </Flex>

      {/* Notifications Drawer */}
      <Drawer isOpen={isNotifOpen} placement="right" onClose={() => setIsNotifOpen(false)} size="sm">
        <DrawerOverlay />
        <DrawerContent bg={bgCard}>
          <DrawerCloseButton />
          <DrawerHeader>
            Notifications
            <Button size="xs" ml={4} onClick={markAllRead}>Mark All as Read</Button>
          </DrawerHeader>
          <DrawerBody>
            {notifications.length === 0 ? <Text color={notifText}>No notifications</Text> :
              <VStack align="stretch" spacing={3}>
                {notifications.map((n) => (
                  <Box
                    key={n.id}
                    p={3}
                    bg={n.type === "Overdue" ? useColorModeValue("red.50", "red.800") :
                        n.type === "Due Soon" ? useColorModeValue("yellow.50", "yellow.800") :
                        useColorModeValue("green.50", "green.800")}
                    borderLeftWidth={4}
                    borderLeftColor={n.type === "Overdue" ? "red.400" :
                        n.type === "Due Soon" ? "yellow.400" :
                        "green.400"}
                    borderRadius="md"
                    opacity={n.read ? 0.6 : 1}
                    position="relative"
                  >
                    <Text fontWeight="bold" color={notifText}>{n.type}</Text>
                    <Text fontSize="sm" color={notifText}>{n.message}</Text>
                    {!n.read && (
                      <IconButton
                        size="xs"
                        icon={<FiCheck />}
                        position="absolute"
                        top={2}
                        right={2}
                        onClick={() => markNotificationRead(n.id)}
                        aria-label="Mark as read"
                      />
                    )}
                  </Box>
                ))}
              </VStack>
            }
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Subscriptions & Analytics */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {/* Subscriptions */}
        <Box bg={bgCard} shadow="lg" borderRadius="2xl" p={4}>
          <Flex justify="space-between" mb={4} flexWrap="wrap">
            <Heading size="md">Active Subscriptions</Heading>
            <HStack spacing={2}>
              <Button colorScheme="orange" size="sm" onClick={() => navigate("/subscriptions")}>Upgrade Plan</Button>
              <Button colorScheme="blue" size="sm" onClick={() => { setEditData(null); setIsModalOpen(true); }}>+ Add</Button>
              <Button colorScheme="teal" size="sm" onClick={() => navigate("/savings")}>View Savings Recommendations</Button>
            </HStack>
          </Flex>

          <HStack mb={4} spacing={3} flexWrap="wrap">
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              {categories.map((cat) => <option key={cat}>{cat}</option>)}
            </Select>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              {statuses.map((s) => <option key={s}>{s}</option>)}
            </Select>
            <Select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="name">Sort by Name</option>
              <option value="amount">Sort by Amount</option>
              <option value="next_renewal_date">Sort by Renewal Date</option>
            </Select>
          </HStack>

          {filteredSubscriptions.length === 0 ? <Text color={useColorModeValue("gray.500", "gray.300")}>No subscriptions found.</Text> :
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
                    onDelete={handleDelete}
                    onEdit={() => handleEdit(sub)}
                    borderColor={status === "Overdue" ? "red.400" : undefined}
                    status={status}
                    statusColor={getStatusColor(status)}
                    previousAmount={getPreviousAmount(sub)}
                  />
                );
              })}
            </VStack>
          }
        </Box>

        {/* Analytics */}
        <Box bg={bgCard} shadow="lg" borderRadius="2xl" p={4}>
          <Heading size="md" mb={4}>Spending Analytics</Heading>

          {pieData.length === 0 ? <Text color={useColorModeValue("gray.500", "gray.300")}>No data yet to show analytics.</Text> :
            <Box height="350px">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${percent}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <Text mt={3} fontWeight="medium" textAlign="center">Total Spent: ${totalSpent.toFixed(2)}</Text>
            </Box>
          }

          <Divider my={6} />

          <Box height="350px">
            {stackedBarData.length === 0 ? <Text color={useColorModeValue("gray.500", "gray.300")}>No monthly data yet.</Text> :
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stackedBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke={useColorModeValue("gray.700", "gray.100")} />
                  <YAxis stroke={useColorModeValue("gray.700", "gray.100")} />
                  <Tooltip />
                  <Legend />
                  {Object.keys(categoryTotals).map((cat, i) => (
                    <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[i % COLORS.length]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            }
          </Box>
        </Box>
      </SimpleGrid>

      <AddSubscriptionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdded={fetchData} editData={editData} />
    </Box>
  );
}
