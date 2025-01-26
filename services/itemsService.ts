import { BASE_URL, ImageObject } from "./userServices";

export interface UserItemsTracks {
    limit: number,
    total: number,
    offset: number,
    next: string,
    previous: string,
    items: TrackObject[]
}

export interface TrackObject {
    album: AlbumObject,
    artists: ArtistObject[],
    name: string,
    id: string,
    popularity: number,
}

export interface AlbumObject {
    id: string,
    external_urls: { spotify: string },
    images: ImageObject[],
    name: string,
    release_date: string,
}

export interface ArtistObject {
    id: string,
    external_urls: { spotify: string },
    images: ImageObject[],
    name: string,
}

export enum ItemsTimeRange {
    long_term = "long_term", // ~1 year
    medium_term = "medium_term", // 6 months
    short_term = "short_term", // 1 month
}

export async function getUserTopItemsTracks(accessToken: string, timeRange: ItemsTimeRange, limit: number): Promise<UserItemsTracks> {
    var validatedLimit = 10;
    if (limit > 0 && limit <= 50) {
        validatedLimit = limit;
    }

    const url = new URL(`${BASE_URL}/me/top/tracks`);
    url.searchParams.append('time_range', timeRange);
    url.searchParams.append('limit', validatedLimit.toString());

    const response = await fetch(
        url.toString(),
        {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` }
        }
    );

    if (!response.ok) {
        throw new Error('Falha ao obter dados do usuário');
    }

    return response.json();
}