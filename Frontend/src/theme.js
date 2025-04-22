import { createTheme } from "@mui/material/styles";

const App_Bar_Height = "48px";
const Board_Bar_Height = "52px";
const Board_Content_Height = `calc(100vh - ${App_Bar_Height} - ${Board_Bar_Height})`;

const Column_Header_Height = "50px";
const Column_Footer_Height = "45px";
// Create a theme instance.
const theme = createTheme({
  trello: {
    appBarHeight: App_Bar_Height,
    boardBarHeight: Board_Bar_Height,
    boardContentHeight: Board_Content_Height,
    columnHeaderHeight: Column_Header_Height,
    columnFooterHeight: Column_Footer_Height,
  },
  palette: {
    primary: {
      light: "#d1d8e0",
      main: "#0c66e4",
      dark: "teal",
      // contrastText: "#03a9f4",
    },
    secondary: {
      light: "#ff7961",
      main: "#000",
      dark: "#ab003c",
      contrastText: "#ffffff",
    },
    text: {
      primary: "#172b4d", // --ds-text
      secondary: "#6b778c",
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: "0.85rem",
          textTransform: "none",
        },
      },
    },

    MuiTypography: {
      styleOverrides: {
        root: {
          fontSize: "14px",
          "&.MuiTypography-body1": {
            fontSize: "14px",
          },
        },
      },
    }, //Chỉnh cỡ chữ của SideBar

    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.secondary.contrastText,
          fontSize: "0.75rem",
        }),
      },
    },
  },
});
export default theme;
