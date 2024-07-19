import { extendTheme } from "@chakra-ui/react";

const breakpoints = {
  base: "0px",
  sm: "320px",
  md: "768px",
  lg: "960px",
  xl: "1200px",
  xxl: "1536px",
};

export const theme = extendTheme({
  breakpoints,
  colors: {
    brand: {
      logInBgColor: "#fff",
      logInTextColor: "white",
      danger: "#BF3131",
      hoverDanger: "#7D0A0A",
    },
  },
});
