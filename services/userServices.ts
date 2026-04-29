export const BASE_URL = 'https://api.spotify.com/v1';

export interface SpotifyUserProfile {
    id: string;
    email: string;
    display_name: string;
    images: ImageObject[];
}

export interface ImageObject {
    url: string;
}

export async function getUserProfile(accessToken: string): Promise<SpotifyUserProfile> {
    const response = await fetch(`${BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        throw new Error(`Falha ao obter dados do usuário (${response.status})`);
    }

    return response.json();
}
