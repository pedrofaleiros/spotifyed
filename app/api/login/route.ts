import { NextResponse } from 'next/server';

//login
export async function GET() {
    const { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } = process.env;
    
    const state = Math.random().toString(36).substring(2, 15);
    const scope = 'user-read-private user-read-email user-top-read playlist-modify-public';

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID!,
        scope,
        redirect_uri: SPOTIFY_REDIRECT_URI!,
        state,
    });

    return NextResponse.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
}
