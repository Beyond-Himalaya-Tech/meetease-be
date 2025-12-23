import { useNavigate } from "@tanstack/react-router";
import {
  Box,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import {
  SearchOff as SearchOffIcon,
} from "@mui/icons-material";

export default function NotFoundComponent() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: { xs: 2, sm: 3 },
        py: { xs: 4, sm: 6 },
      }}
    >
      <Stack spacing={3} alignItems="center" sx={{ maxWidth: 600, width: "100%" }}>

        {/* 404 Number */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "4rem", sm: "5rem", md: "6rem" },
            fontWeight: 700,
            color: "text.primary",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          404
        </Typography>

        {/* Title */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
          }}
        >
          Page Not Found
        </Typography>

        {/* Description */}
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            maxWidth: 480,
            textAlign: "center",
            lineHeight: 1.6,
            fontSize: { xs: "0.95rem", sm: "1rem" },
          }}
        >
          The page you're looking for doesn't exist or may have been moved.
          Please check the URL or navigate back to a valid page.
        </Typography>

        {/* Quick Links */}
        <Box sx={{ mt: 2, pt: 4, borderTop: 1, borderColor: "divider", width: "100%" }}>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontSize: "0.75rem",
              fontWeight: 600,
              mb: 2,
              display: "block",
              textAlign: "center",
            }}
          >
            Quick Links
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
          >
            <Button
              variant="text"
              size="small"
              onClick={() => navigate({ to: "/dashboard" })}
              sx={{
                textTransform: "none",
                color: "text.secondary",
                fontSize: "0.875rem",
                "&:hover": {
                  color: "primary.main",
                  bgcolor: "action.hover",
                },
              }}
            >
              Dashboard
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={() => navigate({ to: "/scheduling" })}
              sx={{
                textTransform: "none",
                color: "text.secondary",
                fontSize: "0.875rem",
                "&:hover": {
                  color: "primary.main",
                  bgcolor: "action.hover",
                },
              }}
            >
              Scheduling
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={() => navigate({ to: "/bookings" })}
              sx={{
                textTransform: "none",
                color: "text.secondary",
                fontSize: "0.875rem",
                "&:hover": {
                  color: "primary.main",
                  bgcolor: "action.hover",
                },
              }}
            >
              Bookings
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={() => navigate({ to: "/customers" })}
              sx={{
                textTransform: "none",
                color: "text.secondary",
                fontSize: "0.875rem",
                "&:hover": {
                  color: "primary.main",
                  bgcolor: "action.hover",
                },
              }}
            >
              Contacts
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={() => navigate({ to: "/profile" })}
              sx={{
                textTransform: "none",
                color: "text.secondary",
                fontSize: "0.875rem",
                "&:hover": {
                  color: "primary.main",
                  bgcolor: "action.hover",
                },
              }}
            >
              Profile
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

