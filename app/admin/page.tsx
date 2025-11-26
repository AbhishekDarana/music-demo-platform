"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Cookies from "js-cookie"; // Import this

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      Cookies.set("token", data.session.access_token, { path: '/', expires: 1 });
    
      router.refresh();
      
      router.push("/admin/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-[var(--bg-dark)] px-4">
      <div className="bg-[var(--bg-card)] p-12 rounded-3xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-[var(--fg-white)] mb-6 text-center">
          Admin Login
        </h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-4 mb-4 rounded-xl text-black placeholder-gray-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-4 mb-6 rounded-xl text-black placeholder-gray-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        <button
          className="w-full py-4 bg-[var(--accent)] text-white font-semibold rounded-xl hover:bg-blue-500 transition disabled:opacity-50"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}