import { inngest } from "./client";
import { supabase } from "@/lib/supabaseClient";
import { parseBuffer } from 'music-metadata';

export const processAudioJob = inngest.createFunction(
  { id: "process-audio-upload" },
  { event: "track/uploaded" },
  async ({ event, step }) => {
    const { trackId, fileUrl } = event.data;

    const fileBuffer = await step.run("download-file", async () => {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Failed to download file");
      return Buffer.from(await response.arrayBuffer());
    });


    const metadata = await step.run("extract-metadata", async () => {
      const parsed = await parseBuffer(new Uint8Array(fileBuffer.data));
    
      return {
        format: parsed.format.container,
        duration: parsed.format.duration || 0,
        bitrate: parsed.format.bitrate || 0,
        sampleRate: parsed.format.sampleRate,
        codec: parsed.format.codec,
      };
    });

    await step.run("update-database", async () => {
      const { error } = await supabase
        .from("tracks")
        .update({
          description: `Duration: ${metadata.duration.toFixed(2)}s | Bitrate: ${Math.round(metadata.bitrate / 1000)}kbps | Codec: ${metadata.codec}`,
          bpm: "0", 
        })
        .eq("id", trackId);

      if (error) throw new Error(error.message);
    });

    return { success: true, trackId };
  }
);