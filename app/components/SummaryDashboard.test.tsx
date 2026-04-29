import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SummaryDashboard from "./SummaryDashboard";
import {
  getUserTopItemsArtists,
  getUserTopItemsTracks,
  ItemsTimeRange,
  TopArtistObject,
  TrackObject,
} from "@/services/itemsService";

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

const mockedGetUserTopItemsTracks = vi.mocked(getUserTopItemsTracks);
const mockedGetUserTopItemsArtists = vi.mocked(getUserTopItemsArtists);

function makeTrack(overrides: Partial<TrackObject> = {}): TrackObject {
  return {
    id: "track-1",
    name: "Track Name",
    popularity: 80,
    uri: "spotify:track:track-1",
    external_urls: { spotify: "https://spotify.test/track" },
    artists: [
      {
        id: "artist-1",
        name: "Artist A",
        images: [],
        external_urls: { spotify: "https://spotify.test/artist-a" },
      },
    ],
    album: {
      id: "album-1",
      name: "Album A",
      release_date: "2024-01-01",
      images: [],
      external_urls: { spotify: "https://spotify.test/album" },
    },
    ...overrides,
  };
}

function makeArtist(overrides: Partial<TopArtistObject> = {}): TopArtistObject {
  return {
    id: "artist-1",
    name: "Artist A",
    popularity: 90,
    genres: ["rock", "indie"],
    followers: { total: 1000 },
    images: [],
    external_urls: { spotify: "https://spotify.test/artist" },
    ...overrides,
  };
}

describe("SummaryDashboard", () => {
  beforeEach(() => {
    mockedGetUserTopItemsTracks.mockReset();
    mockedGetUserTopItemsArtists.mockReset();
  });

  it("shows the initial loading state", () => {
    mockedGetUserTopItemsTracks.mockReturnValue(new Promise(() => undefined));
    mockedGetUserTopItemsArtists.mockReturnValue(new Promise(() => undefined));

    render(<SummaryDashboard token="token" />);

    expect(screen.getByText("Carregando...")).toBeInTheDocument();
    expect(mockedGetUserTopItemsTracks).toHaveBeenCalledWith(
      "token",
      ItemsTimeRange.short_term,
      10
    );
    expect(mockedGetUserTopItemsArtists).toHaveBeenCalledWith(
      "token",
      ItemsTimeRange.short_term,
      10
    );
  });

  it("renders summary metrics from top tracks and artists", async () => {
    mockedGetUserTopItemsTracks.mockResolvedValue({
      limit: 10,
      total: 2,
      offset: 0,
      next: "",
      previous: "",
      items: [
        makeTrack(),
        makeTrack({
          id: "track-2",
          name: "Track 2",
          popularity: 60,
          artists: [
            {
              id: "artist-1",
              name: "Artist A",
              images: [],
              external_urls: { spotify: "https://spotify.test/artist-a" },
            },
          ],
        }),
        makeTrack({
          id: "track-3",
          name: "Track 3",
          popularity: 100,
          artists: [
            {
              id: "artist-2",
              name: "Artist B",
              images: [],
              external_urls: { spotify: "https://spotify.test/artist-b" },
            },
          ],
          album: {
            id: "album-2",
            name: "Album B",
            release_date: "2023-01-01",
            images: [],
            external_urls: { spotify: "https://spotify.test/album-b" },
          },
        }),
      ],
    });
    mockedGetUserTopItemsArtists.mockResolvedValue({
      limit: 10,
      total: 1,
      offset: 0,
      next: "",
      previous: "",
      items: [makeArtist()],
    });

    render(<SummaryDashboard token="token" />);

    expect(await screen.findByText("Seu retrato musical")).toBeInTheDocument();
    expect(screen.getAllByText("Artist A")[0]).toBeInTheDocument();
    expect(screen.getByText("2 aparições entre as faixas")).toBeInTheDocument();
    expect(screen.getByText("Album A")).toBeInTheDocument();
    expect(screen.getByText("2024")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getAllByText("rock, indie")[0]).toBeInTheDocument();
    expect(screen.getByText("3 faixas + 1 artistas")).toBeInTheDocument();
  });

  it("renders fallback metric values when some data is missing", async () => {
    mockedGetUserTopItemsTracks.mockResolvedValue({
      limit: 10,
      total: 1,
      offset: 0,
      next: "",
      previous: "",
      items: [
        makeTrack({
          artists: [],
          album: {
            id: "album-1",
            name: "",
            release_date: "",
            images: [],
            external_urls: { spotify: "https://spotify.test/album" },
          },
        }),
      ],
    });
    mockedGetUserTopItemsArtists.mockResolvedValue({
      limit: 10,
      total: 0,
      offset: 0,
      next: "",
      previous: "",
      items: [],
    });

    render(<SummaryDashboard token="token" />);

    expect(await screen.findByText("Seu retrato musical")).toBeInTheDocument();
    expect(screen.getAllByText("Sem dados").length).toBeGreaterThan(0);
    expect(screen.getByText("Ranking vazio")).toBeInTheDocument();
    expect(screen.getByText("Datas indisponíveis")).toBeInTheDocument();
  });

  it("renders an empty state when there is no data", async () => {
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
      items: [],
    });

    render(<SummaryDashboard token="token" />);

    expect(
      await screen.findByText(
        "Nenhum dado encontrado para esse período. Tente selecionar 6 meses ou 1 ano."
      )
    ).toBeInTheDocument();
  });

  it("treats missing summary item arrays as empty", async () => {
    mockedGetUserTopItemsTracks.mockResolvedValue({
      limit: 10,
      total: 0,
      offset: 0,
      next: "",
      previous: "",
    } as Awaited<ReturnType<typeof getUserTopItemsTracks>>);
    mockedGetUserTopItemsArtists.mockResolvedValue({
      limit: 10,
      total: 0,
      offset: 0,
      next: "",
      previous: "",
    } as Awaited<ReturnType<typeof getUserTopItemsArtists>>);

    render(<SummaryDashboard token="token" />);

    expect(
      await screen.findByText(
        "Nenhum dado encontrado para esse período. Tente selecionar 6 meses ou 1 ano."
      )
    ).toBeInTheDocument();
  });

  it("renders an error state when loading fails", async () => {
    mockedGetUserTopItemsTracks.mockRejectedValue(new Error("bad token"));
    mockedGetUserTopItemsArtists.mockResolvedValue({
      limit: 10,
      total: 0,
      offset: 0,
      next: "",
      previous: "",
      items: [],
    });

    render(<SummaryDashboard token="token" />);

    expect(
      await screen.findByText("Não foi possível carregar o resumo dessa conta.")
    ).toBeInTheDocument();
  });

  it("updates the summary when filters change", async () => {
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

    render(<SummaryDashboard token="token" />);
    expect(await screen.findByText("Seu retrato musical")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "6 meses" }));
    await waitFor(() =>
      expect(mockedGetUserTopItemsTracks).toHaveBeenLastCalledWith(
        "token",
        ItemsTimeRange.medium_term,
        10
      )
    );

    await userEvent.click(screen.getByRole("button", { name: "30" }));
    await waitFor(() =>
      expect(mockedGetUserTopItemsArtists).toHaveBeenLastCalledWith(
        "token",
        ItemsTimeRange.medium_term,
        30
      )
    );
  });
});
