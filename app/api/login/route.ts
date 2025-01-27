import { NextResponse } from 'next/server';

//login
export async function GET() {
    const { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } = process.env;

    console.log("--------------------- Environment ----------------------")
    console.log(SPOTIFY_REDIRECT_URI)

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

/* 

https://accounts.spotify.com/authorize?response_type=code&client_id=ab80c067ae70469a91a83005ff894aae&scope=user-read-private+user-read-email+user-top-read+playlist-modify-public&
// redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fcallback&state=wbcxb7imvw
*/

/* 

https://accounts.spotify.com/authorize?response_type=code&client_id=ab80c067ae70469a91a83005ff894aae&scope=user-read-private+user-read-email+user-top-read+playlist-modify-public
// &redirect_uri=undefined&state=xsydpzpy8r
*/