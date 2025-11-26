"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; 
import {
  Container, Box, Grid, Card, CardContent, Typography, TextField, Button,
  Avatar, Chip, Stack, Tabs, Tab, MenuItem, Select, InputLabel, FormControl, Rating,
  Divider, IconButton, Collapse, ThemeProvider, CssBaseline, AppBar, Toolbar
} from "@mui/material";
import {
  ExpandMore, ExpandLess, Search, Email, Dashboard, Logout
} from "@mui/icons-material";

import { socialTheme } from "@/theme/socialTheme";
import { supabase } from "@/lib/supabaseClient";
import WaveformPlayer from "@/components/admin/WaveformPlayer";
import EmailEditor from "@/components/admin/EmailEditor";

interface Track {
  id: string;
  title: string;
  genre: string;
  bpm: string;
  key_signature: string;
  file_url: string;
}

interface Submission {
  id: string;
  name: string;
  email: string;
  bio: string;
  status: "Pending" | "In-Review" | "Approved" | "Rejected";
  rating: number;
  notes: string;
  created_at: string;
  tracks: Track[];
}

export default function DashboardUI() {
  const router = useRouter();
  const [tabIndex, setTabIndex] = useState(0);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    Cookies.remove("token");
    router.push("/admin/login");
    router.refresh();
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data } = await supabase
        .from("submissions")
        .select(`*, tracks(*)`)
        .order("created_at", { ascending: false });

      if (data) setSubmissions(data as Submission[]);
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("admin-dashboard-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "submissions" },
        async (payload) => {
          const { data: newSubmission } = await supabase
            .from("submissions")
            .select(`*, tracks(*)`)
            .eq("id", payload.new.id)
            .single();

          if (newSubmission) {
            setSubmissions((prev) => [newSubmission as Submission, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdateSubmission = async (id: string, updates: Partial<Submission>) => {
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, ...updates } : sub))
    );
    await supabase.from("submissions").update(updates).eq("id", id);
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(search.toLowerCase()) ||
      sub.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || sub.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "success";
      case "Rejected": return "error";
      case "In-Review": return "warning";
      default: return "default";
    }
  };

  return (
    <ThemeProvider theme={socialTheme}>
      <CssBaseline />
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Toolbar>
          <Typography variant="h6" color="primary" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            Admin Dashboard
          </Typography>
          <Button startIcon={<Logout />} color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 4, borderBottom: 1, borderColor: "divider" }}>
          <Tab icon={<Dashboard />} label="Submissions" iconPosition="start" />
          <Tab icon={<Email />} label="Email Templates" iconPosition="start" />
        </Tabs>

        {tabIndex === 0 ? (
          <>
            <Card elevation={0} sx={{ mb: 3, border: "1px solid #e0e0e0" }}>
              <CardContent sx={{ py: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, md:6}}>
                    <TextField
                    id="search-bar"
                    fullWidth
                    size="small"
                    placeholder="Search Artist or Email..."
                    slotProps={{
                        input: {
                        startAdornment: <Search color="action" sx={{ mr: 1 }} />,
                        },
                    }}
                    
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md:6}}>
                    <Stack direction="row" justifyContent="flex-end" spacing={2}>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Filter Status</InputLabel>
                        <Select value={filterStatus} label="Filter Status" onChange={(e) => setFilterStatus(e.target.value)}>
                          <MenuItem value="All">All Statuses</MenuItem>
                          <MenuItem value="Pending">Pending</MenuItem>
                          <MenuItem value="In-Review">In-Review</MenuItem>
                          <MenuItem value="Approved">Approved</MenuItem>
                          <MenuItem value="Rejected">Rejected</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Stack spacing={2}>
              {loading ? (
                <Typography>Loading...</Typography>
              ) : (
                filteredSubmissions.map((sub) => (
                  <Card key={sub.id} elevation={1} sx={{ overflow: "visible" }}>
                    <CardContent>
                      <Grid container alignItems="center" spacing={2}>
                        <Grid>
                          <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>{sub.name[0]}</Avatar>
                        </Grid>
                        <Grid>
                          <Typography variant="h6" fontWeight="bold">{sub.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{sub.email} • {sub.tracks.length} Tracks</Typography>
                          <Typography variant="caption" color="text.secondary">{new Date(sub.created_at).toLocaleDateString()}</Typography>
                        </Grid>
                        <Grid>
                          <Chip label={sub.status || "Pending"} color={getStatusColor(sub.status) as any} size="small" sx={{ fontWeight: "bold" }} />
                        </Grid>
                        <Grid>
                          <IconButton onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}>
                            {expandedId === sub.id ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </Grid>
                      </Grid>

                      <Collapse in={expandedId === sub.id}>
                        <Divider sx={{ my: 2 }} />
                        <Grid container spacing={4}>
                          <Grid size={{ xs: 12, md:7}}>
                            <Typography variant="subtitle2" gutterBottom>Biography</Typography>
                            <Typography variant="body2" paragraph sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 2 }}>{sub.bio || "No bio provided."}</Typography>
                            <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>Tracks</Typography>
                            <Stack spacing={2}>
                              {sub.tracks.map((track) => (
                                <Box key={track.id}>
                                  <Typography variant="caption" fontWeight="bold">{track.title}</Typography>
                                  <WaveformPlayer audioUrl={track.file_url} />
                                </Box>
                              ))}
                            </Stack>
                          </Grid>
                          <Grid size={{ xs: 12, md:5}}>
                            <Card variant="outlined" sx={{ bgcolor: "#fafafa" }}>
                              <CardContent>
                                <Typography variant="h6" gutterBottom>Review & Grade</Typography>
                                <Typography component="legend" variant="caption">Rating (1-10)</Typography>
                                <Rating max={10} value={sub.rating} onChange={(_, val) => handleUpdateSubmission(sub.id, { rating: val || 0 })} />
                                <Box mt={2}>
                                  <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select value={sub.status || "Pending"} label="Status" onChange={(e) => handleUpdateSubmission(sub.id, { status: e.target.value as any })}>
                                      <MenuItem value="Pending">Pending</MenuItem>
                                      <MenuItem value="In-Review">In-Review</MenuItem>
                                      <MenuItem value="Approved">Approved</MenuItem>
                                      <MenuItem value="Rejected">Rejected</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Box>
                                <TextField fullWidth multiline minRows={4} label="Internal Notes / Feedback" variant="outlined" margin="normal" value={sub.notes || ""} onChange={(e) => handleUpdateSubmission(sub.id, { notes: e.target.value })} sx={{ bgcolor: "white" }} />
                                <Button variant="contained" fullWidth sx={{ mt: 2 }}>Save Review</Button>
                              </CardContent>
                            </Card>
                          </Grid>
                        </Grid>
                      </Collapse>
                    </CardContent>
                  </Card>
                ))
              )}
            </Stack>
          </>
        ) : (
          <EmailEditor submissions={submissions} />
        )}
      </Container>
    </ThemeProvider>
  );
}