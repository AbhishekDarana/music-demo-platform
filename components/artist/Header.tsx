import { AppBar, Toolbar, Stack, Avatar, Typography } from "@mui/material";
import { MusicNote as MusicIcon } from "@mui/icons-material";

export default function Header() {
  return (
    <AppBar position="sticky" color="inherit" elevation={1}>
      <Toolbar sx={{ justifyContent: "center" }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
            <MusicIcon fontSize="small" />
          </Avatar>
          <Typography variant="h6" color="primary">
            DemoDrop
          </Typography>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}