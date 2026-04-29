import { describe, expect, it, vi } from "vitest";
import { ItemsTimeRange, TrackObject } from "./itemsService";
import {
  createPlaylistFromTracks,
  getTopPlaylistName,
} from "./playlistService";
import { BASE_URL } from "./userServices";

function makeTrack(id = "track-1"): TrackObject {
  return {
    id,
    name: `Track ${id}`,
    popularity: 80,
    uri: `spotify:track:${id}`,
    external_urls: { spotify: `https://spotify.test/${id}` },
    artists: [],
    album: {
      id: "album-1",
      name: "Album",
      release_date: "2024-01-01",
      images: [],
      external_urls: { spotify: "https://spotify.test/album" },
    },
  };
}

describe("playlistService", () => {
  it("returns the default playlist name for a period", () => {
    expect(getTopPlaylistName(ItemsTimeRange.medium_term)).toBe(
      "Spotifyed - Top dos últimos 6 meses"
    );
  });

  it("creates a public playlist and adds the visible tracks", async () => {
    const playlist = {
      id: "playlist-1",
      name: "Spotifyed - Top do último mês",
      external_urls: { spotify: "https://spotify.test/playlist" },
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(playlist),
      })
      .mockResolvedValueOnce({
        ok: true,
      });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createPlaylistFromTracks("token", [makeTrack()], ItemsTimeRange.short_term)
    ).resolves.toEqual(playlist);

    expect(fetchMock).toHaveBeenNthCalledWith(1, `${BASE_URL}/me/playlists`, {
      method: "POST",
      headers: {
        Authorization: "Bearer token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Spotifyed - Top do último mês",
        description:
          "Criada pelo Spotifyed com suas faixas mais ouvidas do último mês.",
        public: true,
      }),
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${BASE_URL}/playlists/playlist-1/items`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: ["spotify:track:track-1"] }),
      }
    );
  });

  it("throws when no track has a uri", async () => {
    const track = makeTrack();
    track.uri = "";

    await expect(
      createPlaylistFromTracks("token", [track], ItemsTimeRange.short_term)
    ).rejects.toThrow("Não há músicas válidas para criar a playlist.");
  });

  it("throws when playlist creation fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      })
    );

    await expect(
      createPlaylistFromTracks("token", [makeTrack()], ItemsTimeRange.short_term)
    ).rejects.toThrow("Falha ao criar playlist (401)");
  });

  it("throws when adding tracks fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({
            id: "playlist-1",
            name: "Playlist",
            external_urls: { spotify: "https://spotify.test/playlist" },
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 403,
        })
    );

    await expect(
      createPlaylistFromTracks("token", [makeTrack()], ItemsTimeRange.short_term)
    ).rejects.toThrow("Falha ao adicionar músicas à playlist (403)");
  });
});
