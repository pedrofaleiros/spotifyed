import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const refresh_token = searchParams.get('refresh_token');

    if (!refresh_token) {
        return NextResponse.json(
            { error: 'Refresh token is missing' },
            { status: 400 }
        );
    }

    try {
        const params = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token,
        });

        const headers = {
            Authorization:
                'Basic ' +
                Buffer.from(
                    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                ).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
        };

        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            params.toString(),
            { headers }
        );

        const { access_token, refresh_token: new_refresh_token, expires_in } = response.data;

        return NextResponse.json({
            access_token,
            refresh_token: new_refresh_token,
            expires_in: expires_in,
        });
    } catch (error) {

        if (axios.isAxiosError(error)) {
            console.log("data: ", JSON.stringify(error.response?.data, null, 2));
            console.log("message: ", error.message);
        }

        return NextResponse.json(
            { error: 'Failed to refresh token' },
            { status: 500 }
        );
    }
}
