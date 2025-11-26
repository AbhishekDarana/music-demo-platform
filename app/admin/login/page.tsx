"use client";

import React, { useState } from "react";
import { 
  Container, Box, Card, CardContent, Typography, TextField, Button, Alert, ThemeProvider, CssBaseline 
} from "@mui/material";
import { Lock as LockIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { socialTheme } from "@/theme/socialTheme";
import Cookies from "js-cookie"; 

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 1. Supabase Login
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    })

    if (error) {
      alert(error.message)
      return
    }

    // 2. Set Cookie for Middleware
    if (data.session) {
      // { path: '/' } is REQUIRED so Dashboard can see it
      Cookies.set('token', data.session.access_token, { path: '/', expires: 1 }) 
      
      // Force Hard Redirect 
      // This ensures middleware sees the new cookie immediately
      window.location.href = '/admin/dashboard'
    }
  }

  return (
    <ThemeProvider theme={socialTheme}>
      <CssBaseline />
      <Container maxWidth="xs" sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card elevation={3} sx={{ width: "100%", p: 2 }}>
          <CardContent>
            <Box textAlign="center" mb={3}>
              <Box sx={{ bgcolor: "primary.light", width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2, color: "primary.main" }}>
                <LockIcon />
              </Box>
              <Typography variant="h5" fontWeight="bold">Admin Access</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={handleLogin}>
              <TextField fullWidth label="Email" type="email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <TextField fullWidth label="Password" type="password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} required />
              
              <Button fullWidth variant="contained" size="large" type="submit" disabled={loading} sx={{ mt: 3 }}>
                {loading ? "Verifying..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </ThemeProvider>
  );
}