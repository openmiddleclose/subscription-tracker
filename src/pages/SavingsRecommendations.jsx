// src/pages/SavingsRecommendation.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Spinner,
  useToast,
  useColorModeValue,
  SimpleGrid,
  Badge,
  Select,
  Link,
  Divider,
  Button,
} from "@chakra-ui/react";
import { supabase } from "../supabaseClient";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { useNavigate } from "react-router-dom";

export default function SavingsRecommendation() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [recommendations, setRecommendations] = useState({});
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("savings");
  const [chartData, setChartData] = useState([]);
  const [monthlyProjection, setMonthlyProjection] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);

  const toast = useToast();
  const bgPage = useColorModeValue("gray.50", "gray.900");
  const bgCard = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subTextColor = useColorModeValue("gray.600", "gray.300");
  const hoverBg = useColorModeValue("gray.100", "gray.600");
  const altBg = useColorModeValue("green.50", "green.900");
  const altSecondaryBg = useColorModeValue("gray.50", "gray.600");
  const chartBarColor = useColorModeValue("#3182CE", "#63B3ED");
  const chartLineColor = useColorModeValue("#38A169", "#68D391");

  const navigate = useNavigate();

  // Fetch subscriptions & recommendations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          toast({ title: "Not logged in", status: "error" });
          return;
        }

        const { data: subs, error: subsError } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id);

        if (subsError) throw subsError;
        setSubscriptions(subs || []);

        // Generate savings recommendations
        const recs = {};
        let total = 0;
        const categoryMap = {};
        const monthlyMap = Array(12).fill(0);

        for (let sub of subs) {
          const { data: altData, error: altError } = await supabase
            .from("subscription_alternatives")
            .select("*")
            .eq("category", sub.category)
            .lt("amount", sub.amount)
            .order("amount", { ascending: true });

          if (altError) {
            console.error(`Error fetching alternatives for ${sub.name}`, altError);
            recs[sub.id] = [];
            continue;
          }

          const alternativesWithSavings = altData.map((alt) => {
            const monthlySavings = sub.amount - alt.amount;
            const yearlySavings = monthlySavings * 12;
            return { ...alt, monthlySavings, yearlySavings };
          });

          recs[sub.id] = alternativesWithSavings;

          if (alternativesWithSavings.length > 0) {
            const bestAlt = alternativesWithSavings[0];
            total += bestAlt.yearlySavings;
            categoryMap[sub.category] = (categoryMap[sub.category] || 0) + bestAlt.yearlySavings;
            for (let i = 0; i < 12; i++) {
              monthlyMap[i] += bestAlt.monthlySavings;
            }
          }
        }

        setRecommendations(recs);
        setTotalSavings(total);

        // Chart Data
        setChartData(
          Object.keys(categoryMap).map((cat) => ({
            category: cat,
            savings: categoryMap[cat],
          }))
        );

        setMonthlyProjection(
          monthlyMap.map((amt, idx) => ({
            month: dayjs().month(idx).format("MMM"),
            savings: amt,
          }))
        );
      } catch (error) {
        console.error(error);
        toast({
          title: "Error loading recommendations",
          description: error.message,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg={bgPage}>
        <Spinner size="xl" />
      </Box>
    );
  }

  // Sort subscriptions
  const sortedSubs = [...subscriptions].sort((a, b) => {
    if (sortOption === "name") return a.name.localeCompare(b.name);
    if (sortOption === "category") return a.category.localeCompare(b.category);
    const aMax = recommendations[a.id]?.[0]?.monthlySavings || 0;
    const bMax = recommendations[b.id]?.[0]?.monthlySavings || 0;
    return bMax - aMax;
  });

  return (
    <Box minH="100vh" p={{ base: 4, md: 6 }} bg={bgPage}>
      <VStack spacing={6} align="stretch">
        {/* Back Button */}
        <Button onClick={() => navigate(-1)} alignSelf="start" colorScheme="teal">
          &larr; Back
        </Button>

        <Heading size="lg" textAlign="center" color={textColor}>
          Savings Recommendations
        </Heading>

        {/* Total Savings */}
        <Box bg="teal.500" color="white" p={4} rounded="lg" shadow="md" textAlign="center">
          <Text fontSize="sm">Total Potential Yearly Savings</Text>
          <Text fontSize="2xl" fontWeight="bold">${totalSavings.toFixed(2)}</Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Yearly Savings by Category */}
          <Box bg={bgCard} p={4} rounded="lg" shadow="md" minH="300px">
            <Heading size="md" mb={4} color={textColor}>
              Yearly Savings by Category
            </Heading>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="category" stroke={textColor} />
                  <YAxis stroke={textColor} />
                  <RechartTooltip formatter={(val) => `$${val.toFixed(2)}`} />
                  <Legend wrapperStyle={{ color: textColor }} />
                  <Bar dataKey="savings" fill={chartBarColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Text color={subTextColor} textAlign="center" mt={8}>
                No category data available
              </Text>
            )}
          </Box>

          {/* Monthly Savings Projection */}
          <Box bg={bgCard} p={4} rounded="lg" shadow="md" minH="300px">
            <Heading size="md" mb={4} color={textColor}>
              Monthly Savings Projection
            </Heading>
            {monthlyProjection.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyProjection}>
                  <XAxis dataKey="month" stroke={textColor} />
                  <YAxis stroke={textColor} />
                  <RechartTooltip formatter={(val) => `$${val.toFixed(2)}`} />
                  <Legend wrapperStyle={{ color: textColor }} />
                  <Line type="monotone" dataKey="savings" stroke={chartLineColor} strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Text color={subTextColor} textAlign="center" mt={8}>
                No monthly data available
              </Text>
            )}
          </Box>
        </SimpleGrid>

        {/* Sort Option */}
        <HStack spacing={3} mt={4}>
          <Text fontWeight="semibold" color={textColor}>
            Sort by:
          </Text>
          <Select
            w="200px"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            bg={bgCard}
            color={textColor}
          >
            <option value="savings">Best Savings</option>
            <option value="name">Subscription Name</option>
            <option value="category">Category</option>
          </Select>
        </HStack>

        <Divider borderColor={subTextColor} />

        {/* Subscription Recommendations */}
        <VStack spacing={4} align="stretch">
          {sortedSubs.map((sub) => (
            <Box
              key={sub.id}
              bg={bgCard}
              p={4}
              rounded="lg"
              shadow="md"
              _hover={{ transform: "scale(1.02)", transition: "0.2s", bg: hoverBg }}
            >
              <HStack justify="space-between" align="start" mb={2}>
                <Text fontWeight="bold" fontSize="md" color={textColor}>
                  {sub.name} (${sub.amount.toFixed(2)}) - {sub.category}
                </Text>
              </HStack>

              {recommendations[sub.id]?.length > 0 ? (
                <VStack spacing={2} align="stretch">
                  <Text color={chartLineColor} fontWeight="semibold">
                    Cheaper Alternatives:
                  </Text>
                  {recommendations[sub.id].map((alt, idx) => (
                    <HStack
                      key={alt.id}
                      justify="space-between"
                      w="full"
                      align="center"
                      p={2}
                      rounded="md"
                      bg={idx === 0 ? altBg : altSecondaryBg}
                    >
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium" color={textColor}>
                          {alt.name} - ${alt.amount.toFixed(2)}/month
                        </Text>
                        <Text fontSize="sm" color={subTextColor}>
                          Save ${alt.monthlySavings.toFixed(2)}/month, ${alt.yearlySavings.toFixed(2)}/year
                        </Text>
                      </VStack>
                      <HStack spacing={2}>
                        {idx === 0 && (
                          <Badge colorScheme="blue" variant="subtle">
                            Recommended
                          </Badge>
                        )}
                        <Link href={alt.url} isExternal color="blue.400" fontWeight="semibold">
                          Visit
                        </Link>
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
              ) : (
                <Text mt={2} color={subTextColor}>
                  No cheaper alternatives found.
                </Text>
              )}
            </Box>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
}
