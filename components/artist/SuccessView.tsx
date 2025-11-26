import { Paper, Avatar, Typography, Button } from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";

interface SuccessViewProps {
  artistName: string;
}

export default function SuccessView({ artistName }: SuccessViewProps) {
  return (
    <Paper elevation={0} sx={{ p: 5, textAlign: "center", borderRadius: 4 }}>
      <Avatar
        sx={{
          width: 80,
          height: 80,
          bgcolor: "success.light",
          color: "success.main",
          mx: "auto",
          mb: 3,
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 40 }} />
      </Avatar>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Sent!
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Thanks, <strong>{artistName}</strong>. We have received your submission.
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={() => window.location.reload()}
      >
        Submit Another
      </Button>
    </Paper>
  );
}