import { createTheme } from "@mui/material/styles";

const App_Bar_Height = "48px";
const Workspace_Bar_Height = "52px";
const Workspace_Content_Height = `calc(100vh - ${App_Bar_Height} - ${Workspace_Bar_Height})`;

const Column_Header_Height = "50px";
const Column_Footer_Height = "56px";

// Create a theme instance.
const theme = createTheme({
  trello: {
    appBarHeight: App_Bar_Height,
    WorkspaceBarHeight: Workspace_Bar_Height,
    WorkspaceContentHeight: Workspace_Content_Height,
    columnHeaderHeight: Column_Header_Height,
    columnFooterHeight: Column_Footer_Height,
  },
  palette: {
    primary: {
      light: "#d1d8e0",
      main: "#34495e",
      dark: "teal",
      contrastText: "#03a9f4",
    },
    secondary: {
      light: "#ff7961",
      main: "#000", // Black main color
      dark: "#ab003c",
      contrastText: "#ffffff",
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          "*::-webkit-scrollbar": {
            width: "6px",
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
          color: "black", // Button text color
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
    }, // Adjust logo size

    MuiTypography: {
      styleOverrides: {
        root: {
          fontSize: "14px",
          color: "black", // Set default text color to black for Typography
        },
      },
    }, // Adjust font size and color for Typography

    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: "black", // Label color set to black
          fontSize: "0.75rem",
        }),
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: "black", // Input text color
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: "black", // Outline color when input is active or focused
          },
          "&:hover": {
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.primary.dark,
            },
          },
          "& fieldset": {
            borderWidth: "1px !important",
          },
        }),
      },
    },
  },
});

export default theme;
