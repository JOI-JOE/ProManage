import { LineWeight } from "@mui/icons-material";
import { createTheme } from "@mui/material/styles";

const App_Bar_Height = "48px";
const Board_Bar_Height = "56.8px";
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
      main: "#172b4d",
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
  //--------------------------------------------------------------------------------
  /// Màu custom
  alert: {
    success: "#1F845A", // màu xanh đậm
    warning: "#F5CD47", // màu vàng đậm
    danger: "#C9372C", // màu đỏ đậm
  },
  typography: {
    h1: {
      fontWeight: 700,
      fontWeight: "600",
      LineWeight: "24px",
    },
  },
  //--------------------------------------------------------------------------------
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: "0.85rem",
          textTransform: "none",
        },
      },
    },

    // MuiListItemIcon: {
    //   styleOverrides: {
    //     root: {
    //       minWidth: "32px",
    //     },
    //   },
    // },
    // MuiSvgIcon: {
    //   styleOverrides: {
    //     root: {
    //       width: "1rem",
    //     },
    //   },
    // }, //Chỉnh kích thước logo của SideBar

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
