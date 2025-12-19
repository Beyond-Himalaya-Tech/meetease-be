import {
  Dashboard as DashboardIcon,
  Link as LinkIcon,
  CalendarToday as CalendarIcon,
  AccessTime as ClockIcon,
  People as UserGroupIcon,
  Person as UserIcon,
  PowerSettingsNew as PowerIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Link, useRouterState } from "@tanstack/react-router";

const DRAWER_WIDTH = 256;

const navMenu = [
  { name: "Dashboard", to: "/dashboard", icon: <DashboardIcon /> },
  { name: "Scheduling", to: "/scheduling", icon: <LinkIcon /> },
  { name: "Bookings", to: "/bookings", icon: <CalendarIcon /> },
  { name: "Availability", to: "/availability", icon: <ClockIcon /> },
  { name: "Contacts", to: "/customers", icon: <UserGroupIcon /> },
  { name: "Profile", to: "/profile", icon: <UserIcon /> },
];

const logoutItem = { name: "Logout", to: "/logout", icon: <PowerIcon /> };

export const Sidebar = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Brand / logo area */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 2.5,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.contrastText",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            M
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              MeetEase
            </Typography>
          </Box>
        </Box>

        {isMobile && (
          <IconButton
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
            size="small"
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* Navigation list */}
      <Box sx={{ flex: 1, overflow: "auto", py: 2 }}>
        <SidebarNav />
      </Box>

      {/* Logout at bottom */}
      <Box sx={{ borderTop: 1, borderColor: "divider", px: 1.5, py: 1.5 }}>
        <SidebarLogout />
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      open={open}
      onClose={() => setOpen(false)}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          borderRight: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

const SidebarNav = () => {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  return (
    <List sx={{ px: 1.5 }}>
      {navMenu.map((item) => {
        const isActive =
          pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));

        return (
          <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={Link}
              to={item.to}
              selected={isActive}
              sx={{
                borderRadius: 1.5,
                minHeight: 40,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "primary.contrastText",
                  },
                },
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActive ? "primary.contrastText" : "text.secondary",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.name}
                primaryTypographyProps={{
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "0.875rem",
                }}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};

const SidebarLogout = () => {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const isActive =
    pathname === logoutItem.to || pathname.startsWith(logoutItem.to);

  return (
    <List disablePadding>
      <ListItem disablePadding>
        <ListItemButton
          component={Link}
          to={logoutItem.to}
          selected={isActive}
          sx={{
            borderRadius: 1.5,
            minHeight: 40,
            "&.Mui-selected": {
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "&:hover": {
                bgcolor: "primary.dark",
              },
              "& .MuiListItemIcon-root": {
                color: "primary.contrastText",
              },
            },
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 40,
              color: isActive ? "primary.contrastText" : "text.secondary",
            }}
          >
            {logoutItem.icon}
          </ListItemIcon>
          <ListItemText
            primary={logoutItem.name}
            primaryTypographyProps={{
              fontWeight: isActive ? 600 : 500,
              fontSize: "0.875rem",
            }}
          />
        </ListItemButton>
      </ListItem>
    </List>
  );
};