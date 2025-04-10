import { createTheme } from "@mui/material/styles";

const App_Bar_Height = "48px";
const Board_Bar_Height = "52px";
const Board_Content_Height = `calc(100vh - ${App_Bar_Height} - ${Board_Bar_Height})`;

const Column_Header_Height = "50px";
const Column_Footer_Height = "45px";

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
      main: "#34495e",
      dark: "teal",
    },

    secondary: {
      light: "#ff7961",
      main: "#000",
      dark: "#ab003c",
      contrastText: "#ffffff",
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          "*::-webkit-scrollbar": {
            with: "6px",
            height: "6px",
          },

          "*::-webkit-scrollbar-thumb": {
            backgroundColor: "#bdc3c7",
            borderRadius: "8px",
          },
          "*::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#ecf0f1",
            borderRadius: "6px",
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: "0.85rem",
          textTransform: "none",
        },
      },
    },

    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: "32px",
        },
      },
    },

    MuiSvgIcon: {
      styleOverrides: {
        root: {
          width: "1rem",
        },
      },
    },

    MuiTypography: {
      styleOverrides: {
        root: {
          fontSize: "14px",
        },
      },
    },

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
