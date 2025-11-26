"use client";

import { createTheme } from "@mui/material";

export const socialTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2", 
    },
    background: {
      default: "#f0f2f5", 
      paper: "#ffffff",
    },
    text: {
      primary: "#1c1e21",
      secondary: "#65676b",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: { fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 20,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: "#f0f2f5",
          borderRadius: 8,
          "& .MuiOutlinedInput-notchedOutline": { border: "none" },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        title: { fontSize: "1.1rem", fontWeight: 700 },
      },
    },
  },
});