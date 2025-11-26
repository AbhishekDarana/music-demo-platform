"use client";

import React, { useState, ChangeEvent } from "react";
import {
  Container,
  Box,
  Stack,
  Alert,
  Typography,
  Button,
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";

import Header from "@/components/artist/Header";
import SuccessView from "@/components/artist/SuccessView";
import ArtistInfoCard from "@/components/artist/ArtistInfoCard";
import TrackUploadCard from "@/components/artist/TrackUploadCard";
import { TrackFile } from "@/components/artist/TrackItem";
import { supabase } from "@/lib/supabaseClient";

export default function ArtistSubmissionPage() {
  const [view, setView] = useState<"form" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingText, setLoadingText] = useState("Submitting...");

  const [artistInfo, setArtistInfo] = useState({
    name: "", email: "", bio: "", instagram: "", spotify: "",
  });

  const [tracks, setTracks] = useState<TrackFile[]>([]);

  const handleInfoChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setArtistInfo({ ...artistInfo, [e.target.name]: e.target.value });
  };

  const handleMetaChange = (id: string, field: string, value: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, metadata: { ...t.metadata, [field]: value } } : t))
    );
  };

  const handleFilesSelected = (fileList: FileList) => {
    setErrorMsg("");
    const newTracks: TrackFile[] = [];

    Array.from(fileList).forEach((file) => {
      if (file.size > 50 * 1024 * 1024) {
        setErrorMsg(`File ${file.name} is too large (Max 50MB).`);
        return;
      }

      const id = Math.random().toString(36).substring(7);
      
      newTracks.push({
        id,
        file,
        progress: 0, 
        status: "uploading",
        metadata: { 
          title: file.name.replace(/\.[^/.]+$/, ""), 
          genre: "", bpm: "", key: "", description: ""
        },
      });
    });

    setTracks((prev) => [...prev, ...newTracks]);
  };

  const handleRemoveTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSubmit = async () => {
    if (!artistInfo.name || !artistInfo.email) {
      setErrorMsg("Please fill in your Artist Name and Email.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (tracks.length === 0) {
      setErrorMsg("Please upload at least one track.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(""); 

    try {
      const uploadedTracks = await Promise.all(
        tracks.map(async (track) => {
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${track.file.name}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("Demos")
            .upload(filePath, track.file);

          if (uploadError) {
             throw new Error(`Upload failed for ${track.file.name}: ${uploadError.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from("Demos")
            .getPublicUrl(filePath);

          return { ...track, fileUrl: publicUrl };
        })
      );

      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistInfo,
          tracks: uploadedTracks,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Server submission failed");
      }

      setIsSubmitting(false);
      setView("success");

    } catch (err: any) {
      console.error("Submission Error:", err);
      setIsSubmitting(false);
      
      setErrorMsg(err.message || "An unexpected error occurred.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };


  return (
    <>
      <Header />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        {view === "success" ? (
          <SuccessView artistName={artistInfo.name} />
        ) : (
          <Stack spacing={3}>
            <Box textAlign="center" mb={1}>
              <Typography variant="h5" fontWeight="bold">
                Submit Your Demo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload your unreleased tracks for review.
              </Typography>
            </Box>

            {errorMsg && (
              <Alert severity="error" onClose={() => setErrorMsg("")}>
                {errorMsg}
              </Alert>
            )}

            <ArtistInfoCard 
              info={artistInfo} 
              onChange={handleInfoChange} 
            />

            <TrackUploadCard 
              tracks={tracks}
              onFilesSelected={handleFilesSelected}
              onRemoveTrack={handleRemoveTrack}
              onMetaChange={handleMetaChange}
            />

            <Box pb={8}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting}
                onClick={handleSubmit}
                startIcon={isSubmitting ? null : <SendIcon />}
                sx={{ py: 1.5, fontSize: "1.1rem" }}
              >
                {isSubmitting ? loadingText : "Submit Application"}
              </Button>
            </Box>
          </Stack>
        )}
      </Container>
    </>
  );
}