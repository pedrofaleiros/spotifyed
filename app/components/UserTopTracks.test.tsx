import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UserTopTracks from "./UserTopTracks";
import {
  getUserTopItemsArtists,
  getUserTopItemsTracks,
  ItemsTimeRange,
  TopArtistObject,
  TrackObject,
} from "@/services/itemsService";
import { createPlaylistFromTracks } from "@/services/playlistService";

vi.mock("@/services/itemsService", async () => {
  const actual = await vi.importActual<typeof import("@/services/itemsService")>(
    "@/services/itemsService"
  );

  return {
    ...actual,
    getUserTopItemsArtists: vi.fn(),
    getUserTopItemsTracks: vi.fn(),
  };
});

vi.mock("@/services/playlistService", () => ({
  createPlaylistFromTracks: vi.fn(),
}));

const mockedGetUserTopItemsTracks = vi.mocked(getUserTopItemsTracks);
const mockedGetUserTopItemsArtists = vi.mocked(getUserTopItemsArtists);
const mockedCreatePlaylistFromTracks = vi.mocked(createPlaylistFromTracks);

function makeTrack(id = "track-1"): TrackObject {
  return {
    id,
    name: `Track ${id}`,
    popularity: 88,
    uri: `spotify:track:${id}`,
    external_urls: { spotify: `https://spotify.test/${id}` },
    artists: [
      {
        id: "artist-1",
        name: "Artist",
        images: [],
        external_urls: { spotify: "https://spotify.test/artist" },
      },
    ],
    album: {
      id: "album-1",
      name: "Album",
      release_date: "2024-01-01",
      images: [],
      external_urls: { spotify: "https://spotify.test/album" },
    },
  };
}

function makeArtist(id = "artist-1"): TopArtistObject {
  return {
    id,
    name: `Artist ${id}`,
    popularity: 82,
    genres: ["rock", "indie"],
    followers: { total: 1000 },
    images: [],
    external_urls: { spotify: `https://spotify.test/${id}` },
  };
}

describe("UserTopTracks", () => {
  beforeEach(() => {
    mockedGetUserTopItemsTracks.mockReset();
    mockedGetUserTopItemsArtists.mockReset();
    mockedCreatePlaylistFromTracks.mockReset();
  });

  it("shows the initial loading state", () => {
    mockedGetUserTopItemsTracks.mockReturnValue(new Promise(() => undefined));

    render(<UserTopTracks token="token" />);

    expect(screen.getByText("Carregando...")).toBeInTheDocument();
    expect(mockedGetUserTopItemsTracks).toHaveBeenCalledWith(
      "token",
      ItemsTimeRange.short_term,
      10
    );
  });

  it("renders fetched tracks for the default period", async () => {
    mockedGetUserTopItemsTracks.mockResolvedValue({
      limit: 10,
      total: 1,
      offset: 0,
      next: "",
      previous: "",
      items: [makeTrack()],
    });

    render(<UserTopTracks token="token" />);

    expect(await screen.findByText("Track track-1")).toBeInTheDocument();
    expect(
      screen.getByText("1 faixas no ranking de último mês.")
    ).toBeInTheDocument();
    expect(screen.getByText("Música e artista")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Criar playlist" })
    ).toBeInTheDocument();
  });

  it("renders the empty state when Spotify returns no tracks", async () => {
    mockedGetUserTopItemsTracks.mockResolvedValue({
      limit: 10,
      total: 0,
      offset: 0,
      next: "",
      previous: "",
      items: [],
    });

    render(<UserTopTracks token="token" />);

    expect(
      await screen.findByText(
        "Nenhuma faixa encontrada para esse período. Tente selecionar 6 meses ou 1 ano."
      )
    ).toBeInTheDocument();
  });

  it("treats a missing items array as empty", async () => {
    mockedGetUserTopItemsTracks.mockResolvedValue({
      limit: 10,
      total: 0,
      offset: 0,
      next: "",
      previous: "",
    } as Awaited<ReturnType<typeof getUserTopItemsTracks>>);

    render(<UserTopTracks token="token" />);

    expect(
      await screen.findByText(
        "Nenhuma faixa encontrada para esse período. Tente selecionar 6 meses ou 1 ano."
      )
    ).toBeInTheDocument();
  });

  it("renders an error message when loading tracks fails", async () => {
    mockedGetUserTopItemsTracks.mockRejectedValue(new Error("bad token"));

    render(<UserTopTracks token="token" />);

    expect(
      await screen.findByText(
        "Não foi possível carregar as músicas mais ouvidas dessa conta."
      )
    ).toBeInTheDocument();
  });

  it("updates the ranking when filters change", async () => {
    mockedGetUserTopItemsTracks.mockResolvedValue({
      limit: 10,
      total: 1,
      offset: 0,
      next: "",
      previous: "",
      items: [makeTrack()],
    });

    render(<UserTopTracks token="token" />);
    expect(await screen.findByText("Track track-1")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "6 meses" }));
    await waitFor(() =>
      expect(mockedGetUserTopItemsTracks).toHaveBeenLastCalledWith(
        "token",
        ItemsTimeRange.medium_term,
        10
      )
    );
    expect(
      screen.getByText("1 faixas no ranking de últimos 6 meses.")
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "30" }));
    await waitFor(() =>
      expect(mockedGetUserTopItemsTracks).toHaveBeenLastCalledWith(
        "token",
        ItemsTimeRange.medium_term,
        30
      )
    );
  });

  it("switches to top artists and hides playlist creation", async () => {
    mockedGetUserTopItemsTracks.mockResolvedValue({
      limit: 10,
      total: 1,
      offset: 0,
      next: "",
      previous: "",
      items: [makeTrack()],
    });
    mockedGetUserTopItemsArtists.mockResolvedValue({
      limit: 10,
      total: 1,
      offset: 0,
      next: "",
      previous: "",
      items: [makeArtist()],
    });

    render(<UserTopTracks token="token" />);
    expect(await screen.findByText("Track track-1")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Artistas" }));

    expect(await screen.findByText("Artist artist-1")).toBeInTheDocument();
    await waitFor(() =>
      expect(mockedGetUserTopItemsArtists).toHaveBeenCalledWith(
        "token",
        ItemsTimeRange.short_term,
        10
      )
    );
    expect(
      screen.queryByRole("button", { name: "Criar playlist" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("Artista")).toBeInTheDocument();
  });

  it("renders the empty state for top artists", async () => {
    mockedGetUserTopItemsTracks.mockResolvedValue({
      limit: 10,
      total: 1,
      offset: 0,
      next: "",
      previous: "",
      items: [makeTrack()],
    });
    mockedGetUserTopItemsArtists.mockResolvedValue({
      limit: 10,
      total: 0,
      offset: 0,
      next: "",
      previous: "",
      items: [],
    });

    render(<UserTopTracks token="token" />);
    expect(await screen.findByText("Track track-1")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Artistas" }));

    expect(
      await screen.findByText(
        "Nenhum artista encontrado para esse período. Tente selecionar 6 meses ou 1 ano."
      )
    ).toBeInTheDocument();
  });

  it("treats a missing artists items array as empty", async () => {
    mockedGetUserTopItemsTracks.mockResolvedValue({
      limit: 10,
      total: 0,
      offset: 0,
      next: "",
      previous: "",
      items: [],
    });
    mockedGetUserTopItemsArtists.mockResolvedValue({
      limit: 10,
      total: 0,
      offset: 0,
      next: "",
      previous: "",
    } as Awaited<ReturnType<typeof getUserTopItemsArtists>>);

    render(<UserTopTracks token="token" />);
    expect(
      await screen.findByText(
        "Nenhuma faixa encontrada para esse período. Tente selecionar 6 meses ou 1 ano."
      )
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Artistas" }));

    expect(
      await screen.findByText(
        "Nenhum artista encontrado para esse período. Tente selecionar 6 meses ou 1 ano."
      )
    ).toBeInTheDocument();
  });

  it("renders an error message when loading artists fails", async () => {
    mockedGetUserTopItemsTracks.mockResolvedValue({
      limit: 10,
      total: 1,
      offset: 0,
      next: "",
      previous: "",
      items: [makeTrack()],
    });
    mockedGetUserTopItemsArtists.mockRejectedValue(new Error("bad token"));

    render(<UserTopTracks token="token" />);
    expect(await screen.findByText("Track track-1")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Artistas" }));

    expect(
      await screen.findByText(
        "Não foi possível carregar os artistas mais ouvidos dessa conta."
      )
    ).toBeInTheDocument();
  });

  it("creates a playlist from the visible tracks", async () => {
    mockedGetUserTopItemsTracks.mockResolvedValue({
      limit: 10,
      total: 1,
      offset: 0,
      next: "",
      previous: "",
      items: [makeTrack()],
    });
    mockedCreatePlaylistFromTracks.mockResolvedValue({
      id: "playlist-1",
      name: "Spotifyed - Top do último mês",
      external_urls: { spotify: "https://spotify.test/playlist" },
    });

    render(<UserTopTracks token="token" />);
    expect(await screen.findByText("Track track-1")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Criar playlist" }));

    await waitFor(() =>
      expect(mockedCreatePlaylistFromTracks).toHaveBeenCalledWith(
        "token",
        [makeTrack()],
        ItemsTimeRange.short_term
      )
    );
    expect(
      await screen.findByRole("link", {
        name: "Spotifyed - Top do último mês",
      })
    ).toHaveAttribute("href", "https://spotify.test/playlist");
  });

  it("shows an error when playlist creation fails", async () => {
    mockedGetUserTopItemsTracks.mockResolvedValue({
      limit: 10,
      total: 1,
      offset: 0,
      next: "",
      previous: "",
      items: [makeTrack()],
    });
    mockedCreatePlaylistFromTracks.mockRejectedValue(new Error("spotify failed"));

    render(<UserTopTracks token="token" />);
    expect(await screen.findByText("Track track-1")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Criar playlist" }));

    expect(
      await screen.findByText(
        "Não foi possível criar a playlist com essas músicas."
      )
    ).toBeInTheDocument();
  });

  it("shows the updating state while refreshing existing tracks", async () => {
    let resolveSecondCall: (
      value: Awaited<ReturnType<typeof getUserTopItemsTracks>>
    ) => void = () => undefined;

    mockedGetUserTopItemsTracks
      .mockResolvedValueOnce({
        limit: 10,
        total: 1,
        offset: 0,
        next: "",
        previous: "",
        items: [makeTrack()],
      })
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveSecondCall = resolve;
        })
      );

    render(<UserTopTracks token="token" />);
    expect(await screen.findByText("Track track-1")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "1 ano" }));

    expect(await screen.findByText("Atualizando ranking...")).toBeInTheDocument();

    resolveSecondCall({
      limit: 10,
      total: 1,
      offset: 0,
      next: "",
      previous: "",
      items: [makeTrack("track-2")],
    });

    expect(await screen.findByText("Track track-2")).toBeInTheDocument();
  });
});
