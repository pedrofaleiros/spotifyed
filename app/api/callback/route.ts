import { NextResponse } from "next/server";
import axios from "axios";

export interface AuthObject {
  access_token: string,
  expires_in: number,
  refresh_token: string,
}

//callback
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json(
      { error: "Invalid callback parameters" },
      { status: 400 }
    );
  }

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;

    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`;
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve tokens", details: error },
      { status: 500 }
    );
  }
}
