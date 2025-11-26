"use client";

import { useState, useEffect, useRef } from "react";
import {
  Paper,
  IconButton,
  Stack,
  Avatar,
  Box,
  Typography,
  LinearProgress,
  TextField,
  Grid,
} from "@mui/material";
import {
  Close as CloseIcon,
  MusicNote as MusicIcon,
} from "@mui/icons-material";

export interface TrackFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "completed" | "error";
  metadata: {
    title: string;
    genre: string;
    bpm: string;
    key: string;
    description: string;
  };
}

interface TrackItemProps {
  track: TrackFile;
  onRemove: (id: string) => void;
  onMetaChange: (id: string, field: string, value: string) => void;
}

const formatTime = (seconds: number) => {
  if (!seconds || seconds === Infinity || isNaN(seconds)) return "...";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};


const formatSpeed = (bytesPerSecond: number) => {
  if (!bytesPerSecond || bytesPerSecond === Infinity) return "";
  const mb = bytesPerSecond / (1024 * 1024);
  return `${mb.toFixed(2)} MB/s`;
};

export default function TrackItem({
  track,
  onRemove,
  onMetaChange,
}: TrackItemProps) {
  const [uploadStats, setUploadStats] = useState({
    eta: "",
    speed: "",
  });
  
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (track.status !== "uploading") {
      startTimeRef.current = null;
      setUploadStats({ eta: "", speed: "" });
      return;
    }

    if (startTimeRef.current === null && track.progress > 0) {
      startTimeRef.current = Date.now();
    }

    if (startTimeRef.current && track.progress > 0) {
      const now = Date.now();
      const elapsedSeconds = (now - startTimeRef.current) / 1000;

      if (elapsedSeconds > 0.5) {
        const totalBytes = track.file.size;
        const uploadedBytes = totalBytes * (track.progress / 100);
        const bytesPerSecond = uploadedBytes / elapsedSeconds;
        
        const remainingBytes = totalBytes - uploadedBytes;
        const secondsRemaining = remainingBytes / bytesPerSecond;

        setUploadStats({
          eta: formatTime(secondsRemaining),
          speed: formatSpeed(bytesPerSecond),
        });
      }
    }
  }, [track.progress, track.status, track.file.size]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        bgcolor: "#f0f2f5",
        border: "1px solid #e0e0e0",
        position: "relative",
      }}
    >
      <IconButton
        size="small"
        onClick={() => onRemove(track.id)}
        sx={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <Avatar variant="rounded" sx={{ bgcolor: "primary.light" }}>
          <MusicIcon />
        </Avatar>
        <Box flex={1} overflow="hidden" pr={4}>
          <Typography variant="subtitle2" noWrap fontWeight="bold">
            {track.file.name}
          </Typography>

          <Box mt={1}>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <Box flex={1}>
                <LinearProgress
                  variant="determinate"
                  value={track.progress}
                  color={track.status === "completed" ? "success" : "primary"}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight="medium" sx={{ minWidth: 35 }}>
                {Math.round(track.progress)}%
              </Typography>
            </Stack>

            {track.status === "uploading" && track.progress < 100 && (
              <Stack direction="row" justifyContent="space-between">
                 <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {uploadStats.speed ? `${uploadStats.speed}` : 'Starting...'}
                 </Typography>
                 <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {uploadStats.eta ? `${uploadStats.eta} remaining` : 'Calculating...'}
                 </Typography>
              </Stack>
            )}

            {track.status === "completed" && (
               <Typography variant="caption" color="success.main" fontWeight="bold">
                  Upload Complete
               </Typography>
            )}
            
            {track.status === "error" && (
               <Typography variant="caption" color="error.main" fontWeight="bold">
                  Upload Failed
               </Typography>
            )}
          </Box>
        </Box>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            size="small"
            label="Track Title"
            variant="outlined"
            sx={{ bgcolor: "white" }}
            value={track.metadata.title}
            onChange={(e) => onMetaChange(track.id, "title", e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Genre"
            placeholder="e.g. House"
            variant="outlined"
            sx={{ bgcolor: "white" }}
            value={track.metadata.genre}
            onChange={(e) => onMetaChange(track.id, "genre", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="BPM"
            placeholder="e.g. 128"
            type="number"
            variant="outlined"
            sx={{ bgcolor: "white" }}
            value={track.metadata.bpm}
            onChange={(e) => onMetaChange(track.id, "bpm", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Key"
            placeholder="e.g. Am"
            variant="outlined"
            sx={{ bgcolor: "white" }}
            value={track.metadata.key}
            onChange={(e) => onMetaChange(track.id, "key", e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            size="small"
            label="Short Description / Vibe"
            placeholder="Tell us about this specific track..."
            variant="outlined"
            sx={{ bgcolor: "white" }}
            value={track.metadata.description}
            onChange={(e) =>
              onMetaChange(track.id, "description", e.target.value)
            }
          />
        </Grid>
      </Grid>
    </Paper>
  );
}