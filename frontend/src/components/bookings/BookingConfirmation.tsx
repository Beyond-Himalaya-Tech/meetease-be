import {
  Box,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";

type BookingConfirmationProps = {
  eventTitle: string;
  organizerName: string;
  date: Date;
  timeRange: string;
  timezone: string;
};

const BookingConfirmation = ({
  eventTitle,
  organizerName,
  date,
  timeRange,
  timezone,
}: BookingConfirmationProps) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  // Format timezone display (e.g., "Asia/Kathmandu" -> "Nepal Time")
  const formatTimezone = (tz: string) => {
    // Common timezone mappings
    const tzMap: Record<string, string> = {
      "Asia/Kathmandu": "Nepal",
      "America/New_York": "Eastern",
      "America/Los_Angeles": "Pacific",
      "Europe/London": "London",
      "Asia/Tokyo": "Japan",
      "Asia/Dubai": "Dubai",
    };
    
    if (tzMap[tz]) {
      return `${tzMap[tz]} Time`;
    }
    
    // Fallback: format the timezone string nicely
    return tz
      .split("/")
      .pop()
      ?.replace("_", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()) + " Time" || tz;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
        py: { xs: 4, sm: 6 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 600,
          p: { xs: 4, sm: 6, md: 8 },
          textAlign: "center",
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <Stack spacing={4} alignItems="center">
          {/* Success Icon */}
          <CheckCircleIcon
            sx={{
              fontSize: { xs: 64, sm: 80 },
              color: "#10b981", // green-500
            }}
          />

          {/* Main Message */}
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                mb: 1.5,
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
              }}
            >
              You are scheduled
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                fontSize: { xs: "0.95rem", sm: "1rem" },
              }}
            >
              A calendar invitation has been sent to your email address.
            </Typography>
          </Box>

          {/* Event Details Card */}
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              p: 3,
              bgcolor: "#fafafa",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              textAlign: "left",
            }}
          >
            <Stack spacing={2.5}>
              {/* Event Title */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  fontSize: { xs: "1rem", sm: "1.125rem" },
                }}
              >
                {eventTitle}
              </Typography>

              {/* Organizer */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <PersonIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.primary",
                    fontWeight: 500,
                  }}
                >
                  {organizerName}
                </Typography>
              </Box>

              {/* Date & Time */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <CalendarIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.primary",
                    fontWeight: 500,
                  }}
                >
                  {timeRange}, {formatDate(date)}
                </Typography>
              </Box>

              {/* Timezone */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <LanguageIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.primary",
                    fontWeight: 500,
                  }}
                >
                  {formatTimezone(timezone)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Paper>
    </Box>
  );
};

export default BookingConfirmation;

