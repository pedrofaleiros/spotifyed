import {
  getUserTopItemsArtists,
  getUserTopItemsTracks,
  ItemsTimeRange,
  itemsTimeRangeLabels,
  TopArtistObject,
  TrackObject,
} from "@/services/itemsService";
import { createPlaylistFromTracks, CreatedPlaylist } from "@/services/playlistService";
import { useEffect, useState } from "react";
import ArtistComponent from "./ArtistComponent";
import Loading from "./Loading";
import TrackComponent from "./TrackComponent";
import { SetLimitComponent } from "./SetLimitComponent";
import TimeRangeComponent from "./TimeRangeComponent";

interface UserTopTracksProps {
  token: string;
}

type TopItemsMode = "tracks" | "artists";

export default function UserTopTracks({ token }: UserTopTracksProps) {
  const [tracks, setTracks] = useState<TrackObject[]>([]);
  const [artists, setArtists] = useState<TopArtistObject[]>([]);
  const [mode, setMode] = useState<TopItemsMode>("tracks");

  const [timeRange, setTimeRange] = useState<ItemsTimeRange>(
    ItemsTimeRange.short_term
  );
  const [limit, setLimit] = useState<number>(10);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [playlistError, setPlaylistError] = useState<string | null>(null);
  const [createdPlaylist, setCreatedPlaylist] = useState<CreatedPlaylist | null>(
    null
  );
  const periodLabel = itemsTimeRangeLabels[timeRange];
  const currentItemsCount = mode === "tracks" ? tracks.length : artists.length;

  useEffect(() => {
    const fetchUserData = async (token: string) => {
      setIsLoading(true);
      setErrorMessage(null);
      setPlaylistError(null);
      setCreatedPlaylist(null);

      try {
        if (mode === "tracks") {
          const data = await getUserTopItemsTracks(token, timeRange, limit);
          setTracks(data.items || []);
        } else {
          const data = await getUserTopItemsArtists(token, timeRange, limit);
          setArtists(data.items || []);
        }
      } catch (error) {
        if (mode === "tracks") {
          setTracks([]);
        } else {
          setArtists([]);
        }
        setErrorMessage(
          mode === "tracks"
            ? "Não foi possível carregar as músicas mais ouvidas dessa conta."
            : "Não foi possível carregar os artistas mais ouvidos dessa conta."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData(token);
  }, [timeRange, limit, token, mode]);

  const handleCreatePlaylist = async () => {
    setIsCreatingPlaylist(true);
    setPlaylistError(null);
    setCreatedPlaylist(null);

    try {
      const playlist = await createPlaylistFromTracks(token, tracks, timeRange);
      setCreatedPlaylist(playlist);
    } catch (error) {
      setPlaylistError(
        "Não foi possível criar a playlist com essas músicas."
      );
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  if (isLoading && currentItemsCount === 0) return <Loading />;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-green-400">
            Top Spotify
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            {mode === "tracks"
              ? "Suas músicas mais ouvidas"
              : "Seus artistas mais ouvidos"}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {currentItemsCount} {mode === "tracks" ? "faixas" : "artistas"} no
            ranking de {periodLabel}.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
              Tipo
            </p>
            <div className="flex rounded-lg border border-white/10 bg-white/[0.04] p-1">
              {[
                ["tracks", "Músicas"],
                ["artists", "Artistas"],
              ].map(([value, label]) => (
                <button
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                    mode === value
                      ? "bg-green-400 text-gray-950"
                      : "text-gray-400 hover:text-white"
                  }`}
                  key={value}
                  onClick={() => setMode(value as TopItemsMode)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
              Período
            </p>
            <TimeRangeComponent
              timeRange={timeRange}
              setTimeRange={setTimeRange}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
              Itens
            </p>
            <SetLimitComponent limit={limit} setLimit={setLimit} />
          </div>
        </div>
      </div>

      {mode === "tracks" && !errorMessage && tracks.length > 0 && (
        <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">
              Criar playlist com este ranking
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Envia as {tracks.length} faixas exibidas para uma playlist pública.
            </p>
          </div>
          <button
            className="rounded-md bg-green-400 px-4 py-2 text-sm font-bold text-gray-950 transition hover:bg-green-300 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isCreatingPlaylist || isLoading}
            onClick={handleCreatePlaylist}
            type="button"
          >
            {isCreatingPlaylist ? "Criando..." : "Criar playlist"}
          </button>
        </div>
      )}

      {createdPlaylist && (
        <div className="rounded-lg border border-green-400/20 bg-green-400/10 px-4 py-3 text-sm font-medium text-green-100">
          Playlist criada:{" "}
          <a
            className="font-bold text-green-200 underline-offset-4 hover:underline"
            href={createdPlaylist.external_urls.spotify}
            rel="noreferrer"
            target="_blank"
          >
            {createdPlaylist.name}
          </a>
        </div>
      )}

      {playlistError && (
        <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-medium text-red-100">
          {playlistError}
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border border-green-400/20 bg-green-400/10 px-4 py-3 text-sm font-medium text-green-200">
          Atualizando ranking...
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-8 text-center text-red-100">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && tracks.length === 0 && (
        mode === "tracks" ? (
          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-8 text-center text-gray-400">
            Nenhuma faixa encontrada para esse período. Tente selecionar 6 meses
            ou 1 ano.
          </div>
        ) : null
      )}

      {!isLoading && !errorMessage && artists.length === 0 && (
        mode === "artists" ? (
          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-8 text-center text-gray-400">
            Nenhum artista encontrado para esse período. Tente selecionar 6 meses
            ou 1 ano.
          </div>
        ) : null
      )}

      {!isLoading && !errorMessage && mode === "tracks" && tracks.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          <div className="hidden grid-cols-[3rem_4.5rem_minmax(0,1.25fr)_minmax(0,1fr)_7rem] items-center gap-3 px-3 text-xs font-semibold uppercase text-gray-500 sm:grid">
            <span>#</span>
            <span>Capa</span>
            <span>Música e artista</span>
            <span>Álbum</span>
            <span>Popularidade</span>
          </div>

          {tracks.map((track, index) => (
            <TrackComponent index={index} track={track} key={track.id} />
          ))}
        </div>
      )}

      {!isLoading && !errorMessage && mode === "artists" && artists.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          <div className="hidden grid-cols-[3rem_4.5rem_minmax(0,1.25fr)_minmax(0,1fr)_7rem] items-center gap-3 px-3 text-xs font-semibold uppercase text-gray-500 sm:grid">
            <span>#</span>
            <span>Foto</span>
            <span>Artista</span>
            <span>Gêneros</span>
            <span>Popularidade</span>
          </div>

          {artists.map((artist, index) => (
            <ArtistComponent index={index} artist={artist} key={artist.id} />
          ))}
        </div>
      )}
    </section>
  );
}
