import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UserTopTracks from "./UserTopTracks";
import {
  getUserTopItemsTracks,
  ItemsTimeRange,
  TrackObject,
} from "@/services/itemsService";

vi.mock("@/services/itemsService", async () => {
  const actual = await vi.importActual<typeof import("@/services/itemsService")>(
    "@/services/itemsService"
  );

  return {
    ...actual,
    getUserTopItemsTracks: vi.fn(),
  };
});

const mockedGetUserTopItemsTracks = vi.mocked(getUserTopItemsTracks);

function makeTrack(id = "track-1"): TrackObject {
  return {
    id,
    name: `Track ${id}`,
    popularity: 88,
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

describe("UserTopTracks", () => {
  beforeEach(() => {
    mockedGetUserTopItemsTracks.mockReset();
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
