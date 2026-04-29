import {
    ItemsTimeRange,
    TrackObject,
} from "./itemsService";
import { BASE_URL } from "./userServices";

export interface CreatedPlaylist {
    id: string,
    name: string,
    external_urls: { spotify: string },
}

const playlistPeriodLabels: Record<ItemsTimeRange, string> = {
    [ItemsTimeRange.short_term]: "do último mês",
    [ItemsTimeRange.medium_term]: "dos últimos 6 meses",
    [ItemsTimeRange.long_term]: "do último ano",
};

export function getTopPlaylistName(timeRange: ItemsTimeRange): string {
    return `Spotifyed - Top ${playlistPeriodLabels[timeRange]}`;
}

export async function createPlaylistFromTracks(
    accessToken: string,
    tracks: TrackObject[],
    timeRange: ItemsTimeRange
): Promise<CreatedPlaylist> {
    const uris = tracks.map((track) => track.uri).filter(Boolean);

    if (uris.length === 0) {
        throw new Error("Não há músicas válidas para criar a playlist.");
    }

    const playlistResponse = await fetch(`${BASE_URL}/me/playlists`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: getTopPlaylistName(timeRange),
            description: `Criada pelo Spotifyed com suas faixas mais ouvidas ${playlistPeriodLabels[timeRange]}.`,
            public: true,
        }),
    });

    if (!playlistResponse.ok) {
        throw new Error(`Falha ao criar playlist (${playlistResponse.status})`);
    }

    const playlist: CreatedPlaylist = await playlistResponse.json();
    const addItemsResponse = await fetch(`${BASE_URL}/playlists/${playlist.id}/items`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris }),
    });

    if (!addItemsResponse.ok) {
        throw new Error(`Falha ao adicionar músicas à playlist (${addItemsResponse.status})`);
    }

    return playlist;
}
