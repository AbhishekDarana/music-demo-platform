"use client";

import React, { ChangeEvent } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Stack,
  TextField,
  Grid,
  InputAdornment,
} from "@mui/material";
import { Instagram as InstagramIcon } from "@mui/icons-material";

interface ArtistInfoCardProps {
  info: {
    name: string;
    email: string;
    instagram: string;
    spotify: string;
    bio: string;
  };
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function ArtistInfoCard({ 
  info = { name: "", email: "", instagram: "", spotify: "", bio: "" }, 
  onChange 
}: ArtistInfoCardProps) {
  return (
    <Card elevation={1}>
      <CardHeader title="Artist Information" />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Artist Name"
            placeholder="e.g. The Weeknd"
            name="name"
            value={info.name}
            onChange={onChange}
            required
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Email Address"
            placeholder="contact@example.com"
            name="email"
            type="email"
            value={info.email}
            onChange={onChange}
            required
            variant="outlined"
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Instagram"
                placeholder="@username"
                name="instagram"
                value={info.instagram}
                onChange={onChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <InstagramIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Spotify"
                placeholder="Spotify Link"
                name="spotify"
                value={info.spotify}
                onChange={onChange}
                variant="outlined"
              />
            </Grid>
          </Grid>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Artist Bio"
            placeholder="Tell us about your project..."
            name="bio"
            value={info.bio}
            onChange={onChange}
            variant="outlined"
          />
        </Stack>
      </CardContent>
    </Card>
  );
}