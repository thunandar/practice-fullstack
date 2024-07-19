import { Box, Text } from "@chakra-ui/react";
import React from "react";

interface NotFoundProps {
  name: string;
}

const NotFound = ({ name }: NotFoundProps) => {
  return (
    <Box
      width={"100%"}
      height={"75vh"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Text fontSize={"30px"} fontWeight={"bold"}>
        There is no {name}.
      </Text>
    </Box>
  );
};

export default NotFound;
