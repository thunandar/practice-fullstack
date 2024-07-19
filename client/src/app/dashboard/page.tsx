"use client";
import { Text, Flex, SimpleGrid } from "@chakra-ui/react";
import MiniStatistics from "../../components/Dashboard/StatisticsCard";

const Dashboard = () => {
  return (
    <>
      <Text fontSize={20} mb={10} fontWeight={500}>
        Dashboard
      </Text>
      <Flex flexDirection="column">
        <SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing="24px">
          <MiniStatistics
            title={"Total Revenue"}
            amount={"$53,000"}
            percentage={55}
          />
          <MiniStatistics
            title={"Total Owner"}
            amount={"2,300"}
            percentage={5}
          />
          <MiniStatistics
            title={"Total Court"}
            amount={"3,020"}
            percentage={-14}
          />
          <MiniStatistics
            title={"Total User"}
            amount={"173,000"}
            percentage={8}
          />
        </SimpleGrid>
      </Flex>
    </>
  );
};

export default Dashboard;
