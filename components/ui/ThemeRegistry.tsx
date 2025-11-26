"use client";

import React, { useState } from "react";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { socialTheme } from "@/theme/socialTheme"; 

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: "mui" });
    cache.compat = true;
    return {
      cache,
      flush: () => {
        const prevInserted = cache.inserted;
        cache.inserted = {}; 
        return prevInserted;
      },
    };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (Object.keys(names).length === 0) {
      return null;
    }
    
    let styles = "";
    for (const name of Object.keys(names)) {
      styles += names[name];
    }
    
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${Object.keys(names).join(" ")}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={socialTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}