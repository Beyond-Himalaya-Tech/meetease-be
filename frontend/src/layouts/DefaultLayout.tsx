import { Box } from "@mui/material";
import { useState, type ReactNode } from "react";
import { Sidebar } from "../components/Sidebar.tsx";

const DefaultLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "background.default",
      }}
    >
      {/* Sidebar + main content row */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, md: 3.5 },
          overflow: "auto",
          width: { sm: `calc(100% - ${sidebarOpen ? 256 : 0}px)` },
          transition: "width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DefaultLayout;