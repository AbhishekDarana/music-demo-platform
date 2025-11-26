import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { inngest } from "@/inngest/client";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { artistInfo, tracks } = body;

    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert({
        name: artistInfo.name,
        email: artistInfo.email,
        bio: artistInfo.bio,
        instagram: artistInfo.instagram,
        spotify: artistInfo.spotify,
      })
      .select()
      .single();

    if (submissionError) {
      console.error("DB Error:", submissionError);
      throw new Error("Failed to save artist info.");
    }

    const trackData = tracks.map((track: any) => ({
    submission_id: submission.id,
    title: track.metadata.title,
    genre: track.metadata.genre,
    bpm: track.metadata.bpm,
    
    key_signature: track.metadata.key, 
    
    description: track.metadata.description,
    file_url: track.fileUrl,
  }));


    const { data: insertedTracks, error: tracksError } = await supabase
      .from("tracks")
      .insert(trackData)
      .select(); 

    if (tracksError) throw new Error("Failed to save track metadata.");
    
    await Promise.all(
      insertedTracks.map((track) => 
        inngest.send({
          name: "track/uploaded",
          data: {
            trackId: track.id,
            fileUrl: track.file_url
          }
        })
      )
    );

    await resend.emails.send({
      from: "Demo Portal <onboarding@resend.dev>", 
      to: [artistInfo.email],
      subject: "We received your demo submission",
      
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #1976d2;">Submission Received</h1>
          <p>Hi <strong>${artistInfo.name}</strong>,</p>
          <p>We have successfully received your submission containing <strong>${tracks.length} track(s)</strong>.</p>
          <p>Our A&R team will review your demo shortly.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">This is an automated message from the Artist Portal.</p>
        </div>
      `,
    });
    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}