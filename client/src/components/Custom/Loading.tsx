import { Box, Spinner } from "@chakra-ui/react";
import React from "react";

const Loading = () => {
  return (
    <Box
      width={"100%"}
      height={"70vh"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Spinner size="xl" thickness="6px" />
    </Box>
  );
};

export default Loading;
