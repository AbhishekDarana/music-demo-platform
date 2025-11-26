"use client"; 

import { useRef, ChangeEvent } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Box,
  Typography,
  Stack,
} from "@mui/material";
import {
  AttachFile as AttachFileIcon,
  CloudUpload as UploadIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import TrackItem, { TrackFile } from "./TrackItem";

interface TrackUploadCardProps {
  tracks: TrackFile[];
  onFilesSelected: (fileList: FileList) => void;
  onRemoveTrack: (id: string) => void;
  onMetaChange: (id: string, field: string, value: string) => void;
}

export default function TrackUploadCard({
  tracks,
  onFilesSelected,
  onRemoveTrack,
  onMetaChange,
}: TrackUploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
    e.target.value = ""; 
  };

  return (
    <Card elevation={1}>
      <CardHeader
        title="Upload Tracks"
        action={
          <Button
            variant="outlined"
            startIcon={<AttachFileIcon />}
            size="small"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose Files
          </Button>
        }
      />
      
      <input
        type="file"
        multiple
        accept=".mp3,.wav,.flac,.m4a"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <CardContent sx={{ pt: 0 }}>
        {tracks.length === 0 ? (
          <Box
            sx={{
              border: "2px dashed #e0e0e0",
              borderRadius: 2,
              py: 6,
              textAlign: "center",
              cursor: "pointer",
              "&:hover": { bgcolor: "#f9f9f9", borderColor: "primary.main" },
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
            <Typography variant="body1" fontWeight="500">
              Choose Files
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Select multiple tracks at once
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {tracks.map((track) => (
              <TrackItem
                key={track.id}
                track={track}
                onRemove={onRemoveTrack}
                onMetaChange={onMetaChange}
              />
            ))}

            <Button
              fullWidth
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              Choose More Files
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}