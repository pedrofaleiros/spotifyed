import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AppBarUser from "./AppBarUser";
import Loading from "./Loading";
import { SetLimitComponent } from "./SetLimitComponent";
import TimeRangeComponent from "./TimeRangeComponent";
import TrackComponent from "./TrackComponent";
import { ItemsTimeRange, TrackObject } from "@/services/itemsService";

function makeTrack(overrides: Partial<TrackObject> = {}): TrackObject {
  return {
    id: "track-1",
    name: "Track Name",
    popularity: 75,
    external_urls: { spotify: "https://spotify.test/track" },
    artists: [
      {
        id: "artist-1",
        name: "Artist Name",
        images: [],
        external_urls: { spotify: "https://spotify.test/artist" },
      },
    ],
    album: {
      id: "album-1",
      name: "Album Name",
      release_date: "2024-01-15",
      images: [{ url: "https://image.test/album.jpg" }],
      external_urls: { spotify: "https://spotify.test/album" },
    },
    ...overrides,
  };
}

describe("shared components", () => {
  it("renders the loading message", () => {
    render(<Loading />);
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("renders the app bar with avatar and logs out", async () => {
    const onLogout = vi.fn();
    const { container } = render(
      <AppBarUser
        onLogout={onLogout}
        userData={{
          id: "user-1",
          display_name: "Pedro",
          email: "pedro@example.com",
          images: [{ url: "https://image.test/avatar.jpg" }],
        }}
      />
    );

    expect(screen.getByText("Pedro")).toBeInTheDocument();
    expect(screen.getByText("pedro@example.com")).toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://image.test/avatar.jpg"
    );

    await userEvent.click(screen.getByRole("button", { name: "Sair" }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it("renders the app bar without an avatar", () => {
    render(
      <AppBarUser
        onLogout={vi.fn()}
        userData={{
          id: "user-1",
          display_name: "Pedro",
          email: "pedro@example.com",
          images: [],
        }}
      />
    );

    expect(document.querySelector("img")).not.toBeInTheDocument();
  });

  it("changes the selected limit", async () => {
    const setLimit = vi.fn();
    render(<SetLimitComponent limit={10} setLimit={setLimit} />);

    expect(screen.getByRole("button", { name: "10" })).toHaveClass(
      "bg-white"
    );
    expect(screen.getByRole("button", { name: "30" })).toHaveClass(
      "text-gray-400"
    );

    await userEvent.click(screen.getByRole("button", { name: "50" }));
    expect(setLimit).toHaveBeenCalledWith(50);
  });

  it("changes the selected time range", async () => {
    const setTimeRange = vi.fn();
    render(
      <TimeRangeComponent
        timeRange={ItemsTimeRange.short_term}
        setTimeRange={setTimeRange}
      />
    );

    expect(screen.getByRole("button", { name: "1 mês" })).toHaveClass(
      "bg-green-400"
    );
    expect(screen.getByRole("button", { name: "6 meses" })).toHaveClass(
      "text-gray-400"
    );

    await userEvent.click(screen.getByRole("button", { name: "1 ano" }));
    expect(setTimeRange).toHaveBeenCalledWith(ItemsTimeRange.long_term);
  });

  it("renders a track with album art, artist, release year and popularity", () => {
    render(<TrackComponent index={1} track={makeTrack()} />);

    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute(
      "alt",
      "Capa do álbum Album Name"
    );
    expect(screen.getByRole("link", { name: "Track Name" })).toHaveAttribute(
      "href",
      "https://spotify.test/track"
    );
    expect(screen.getByRole("link", { name: "Artist Name" })).toHaveAttribute(
      "href",
      "https://spotify.test/artist"
    );
    expect(screen.getAllByText("Album Name")[0]).toBeInTheDocument();
    expect(screen.getByText("2024")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("renders a track fallback when optional Spotify data is missing", () => {
    const { container } = render(
      <TrackComponent
        index={0}
        track={makeTrack({
          popularity: -20,
          artists: [],
          album: {
            id: "album-1",
            name: "Album Name",
            release_date: "",
            images: [],
            external_urls: { spotify: "https://spotify.test/album" },
          },
        })}
      />
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByText("2024")).not.toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(container.querySelectorAll("a")[1]).toHaveAttribute(
      "href",
      "https://spotify.test/track"
    );
  });

  it("clamps popularity above 100", () => {
    render(<TrackComponent index={0} track={makeTrack({ popularity: 120 })} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });
});
