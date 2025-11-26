"use client";

import React, { useState, useEffect } from "react";
import { 
  Box, TextField, Typography, Paper, Grid, Chip, Stack, 
  Select, MenuItem, FormControl, InputLabel, Button,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Snackbar, Alert as MuiAlert
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send"; 

interface SubmissionSubset {
  id: string;
  name: string;
  email: string;
  status: string;
  notes?: string;
}

interface EmailEditorProps {
  submissions: SubmissionSubset[];
}


const DEFAULT_TEMPLATE = `
<div style="font-family: sans-serif; padding: 20px; color: #333;">
  <h1>Hello {{artist_name}},</h1>
  <p>Thank you for submitting to our label.</p>
  <p>We have reviewed your tracks and our decision is: <strong>{{status}}</strong></p>
  
  <h3>Feedback:</h3>
  <blockquote style="border-left: 4px solid #0070f3; padding-left: 10px; margin-left: 0; color: #555;">
    {{feedback}}
  </blockquote>

  <p>Best,<br/>A&R Team</p>
</div>
`;

export default function EmailEditor({ submissions = [] }: EmailEditorProps) {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [selectedId, setSelectedId] = useState<string>("");
  const [sending, setSending] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: "", 
    severity: "success" as "success" | "error" 
  });

  useEffect(() => {
    if (submissions.length > 0 && !selectedId) {
      setSelectedId(submissions[0].id);
    }
  }, [submissions]);

  const selectedSubmission = submissions.find((s) => s.id === selectedId);

  const getPreviewHtml = (rawTemplate: string, submission: SubmissionSubset) => {
    let processed = rawTemplate;
    const realData = {
      "{{artist_name}}": submission.name,
      "{{status}}": submission.status || "Pending",
      "{{feedback}}": submission.notes || "(No internal notes provided)",
      "{{email}}": submission.email,
    };

    Object.entries(realData).forEach(([key, value]) => {
      const regex = new RegExp(key, "g");
      processed = processed.replace(regex, value);
    });

    return processed;
  };

  const insertVariable = (variable: string) => {
    setTemplate((prev) => prev + variable);
  };

  
  const handleOpenConfirm = () => {
    if (!selectedSubmission) return;
    if (!selectedSubmission.email) {
      setSnackbar({ open: true, message: "This artist has no email address.", severity: "error" });
      return;
    }
    setConfirmOpen(true);
  };


  const handleConfirmSend = async () => {
    setConfirmOpen(false); 
    if (!selectedSubmission) return;

    setSending(true);

    try {
      const liveHtmlContent = getPreviewHtml(template, selectedSubmission);

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedSubmission.email,
          html: liveHtmlContent,
          subject: `Submission Update for ${selectedSubmission.name}`
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error?.message || "Failed to send");

      setSnackbar({ 
        open: true, 
        message: `Email successfully sent to ${selectedSubmission.email}`, 
        severity: "success" 
      });

    } catch (error: any) {
      console.error(error);
      setSnackbar({ 
        open: true, 
        message: `Error sending email: ${error.message}`, 
        severity: "error" 
      });
    } finally {
      setSending(false);
    }
  };

  
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 6, md:6}}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
           <Typography variant="subtitle2">Template Editor</Typography>
           <Box>
             <Typography variant="caption" sx={{ mr: 1 }}>Insert:</Typography>
             <Chip label="Name" size="small" onClick={() => insertVariable("{{artist_name}}")} sx={{ mr: 0.5, cursor: "pointer" }} />
             <Chip label="Status" size="small" onClick={() => insertVariable("{{status}}")} sx={{ mr: 0.5, cursor: "pointer" }} />
             <Chip label="Feedback" size="small" onClick={() => insertVariable("{{feedback}}")} sx={{ cursor: "pointer" }} />
           </Box>
        </Stack>
        
        <TextField
          fullWidth
          multiline
          minRows={20}
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          sx={{
            fontFamily: "monospace",
            bgcolor: "#fafafa",
            "& .MuiInputBase-input": { fontFamily: "monospace", fontSize: "14px" },
          }}
        />
      </Grid>

      
      <Grid size={{ xs: 6, md:6}}>
        <Stack spacing={2} sx={{ height: "100%" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2">Live Preview</Typography>
            <Stack direction="row" spacing={1}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Preview Data</InputLabel>
                <Select
                  value={selectedId}
                  label="Preview Data"
                  onChange={(e) => setSelectedId(e.target.value)}
                  disabled={submissions.length === 0}
                >
                  {submissions.map((sub) => (
                    <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<SendIcon />}
                onClick={handleOpenConfirm}
                disabled={sending || !selectedSubmission}
                size="small"
              >
                {sending ? "Sending..." : "Send to Artist"}
              </Button>
            </Stack>
          </Stack>

          <Paper elevation={0} sx={{ p: 0, flex: 1, minHeight: "500px", border: "1px solid #ccc", bgcolor: "#fff", overflow: "auto", borderRadius: 1 }}>
            {!selectedSubmission ? (
               <Box display="flex" alignItems="center" justifyContent="center" height="100%" p={3}>
                <Typography color="text.secondary">Select an artist to preview.</Typography>
              </Box>
            ) : (
              <div 
                style={{ height: "100%", width: "100%" }}
                dangerouslySetInnerHTML={{ __html: getPreviewHtml(template, selectedSubmission) }} 
              />
            )}
          </Paper>
        </Stack>
      </Grid>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      >
        <DialogTitle>Confirm Email Send</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to send this email to <strong>{selectedSubmission?.email}</strong>?
            The artist will see exactly what is in the live preview.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleConfirmSend} color="primary" variant="contained" autoFocus>
            Yes, Send Email
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Grid>
  );
}