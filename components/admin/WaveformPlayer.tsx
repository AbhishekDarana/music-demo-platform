"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Box, IconButton, Stack, CircularProgress } from "@mui/material";
import { PlayArrow, Pause } from "@mui/icons-material";

interface WaveformPlayerProps {
  audioUrl: string;
}

export default function WaveformPlayer({ audioUrl }: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      url: audioUrl, // Pass URL here directly (V7 feature)
      waveColor: "#b0c4de",
      progressColor: "#1976d2",
      cursorColor: "#1976d2",
      height: 60,
      barWidth: 2,
      barGap: 2,
      normalize: true,
      backend: "WebAudio", 
    });

  
    ws.on("ready", () => {
      setIsReady(true);
    });

    ws.on("finish", () => {
      setIsPlaying(false);
    });

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));

    wavesurferRef.current = ws;

    return () => {
      try {
        ws.destroy();
      } catch (e) {
        console.warn("WaveSurfer cleanup:", e);
      }
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{
        width: "100%",
        bgcolor: "#fff",
        p: 1.5,
        borderRadius: 2,
        border: "1px solid #e0e0e0",
      }}
    >
      <IconButton
        onClick={togglePlay}
        color="primary"
        disabled={!isReady}
        sx={{
          bgcolor: "primary.light",
          "&:hover": { bgcolor: "primary.main", color: "white" },
        }}
      >
        {!isReady ? (
          <CircularProgress size={24} />
        ) : isPlaying ? (
          <Pause />
        ) : (
          <PlayArrow />
        )}
      </IconButton>

      <Box flex={1} ref={containerRef} />
    </Stack>
  );
}