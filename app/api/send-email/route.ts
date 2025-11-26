import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { to, html, subject } = await request.json();

  const data = await resend.emails.send({
    from: 'A&R Team <onboarding@resend.dev>',
    to: to,
    subject: subject,
    html: html, 
  });

  return NextResponse.json(data);
}