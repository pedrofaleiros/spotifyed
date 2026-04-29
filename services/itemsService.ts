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
    external_urls: { spotify: string },
    name: string,
    id: string,
    popularity: number,
    uri: string,
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

export interface UserItemsArtists {
    limit: number,
    total: number,
    offset: number,
    next: string,
    previous: string,
    items: TopArtistObject[]
}

export interface TopArtistObject extends ArtistObject {
    followers: { total: number },
    genres: string[],
    popularity: number,
}

export enum ItemsTimeRange {
    long_term = "long_term", // ~1 year
    medium_term = "medium_term", // 6 months
    short_term = "short_term", // 1 month
}

export const itemsTimeRangeLabels: Record<ItemsTimeRange, string> = {
    [ItemsTimeRange.short_term]: "último mês",
    [ItemsTimeRange.medium_term]: "últimos 6 meses",
    [ItemsTimeRange.long_term]: "último ano",
};

function validateLimit(limit: number): number {
    if (limit > 0 && limit <= 50) {
        return limit;
    }

    return 10;
}

export async function getUserTopItemsTracks(accessToken: string, timeRange: ItemsTimeRange, limit: number): Promise<UserItemsTracks> {
    const validatedLimit = validateLimit(limit);

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
        throw new Error(`Falha ao obter músicas mais ouvidas (${response.status})`);
    }

    return response.json();
}

export async function getUserTopItemsArtists(accessToken: string, timeRange: ItemsTimeRange, limit: number): Promise<UserItemsArtists> {
    const validatedLimit = validateLimit(limit);

    const url = new URL(`${BASE_URL}/me/top/artists`);
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
        throw new Error(`Falha ao obter artistas mais ouvidos (${response.status})`);
    }

    return response.json();
}
