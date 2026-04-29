import {
  getUserTopItemsTracks,
  ItemsTimeRange,
  TrackObject,
} from "@/services/itemsService";
import { useEffect, useState } from "react";
import Loading from "./Loading";
import TrackComponent from "./TrackComponent";
import { SetLimitComponent } from "./SetLimitComponent";
import TimeRangeComponent from "./TimeRangeComponent";

interface UserTopTracksProps {
  token: string;
}

export default function UserTopTracks({ token }: UserTopTracksProps) {
  const [tracks, setTracks] = useState<TrackObject[]>([]);

  const [timeRange, setTimeRange] = useState<ItemsTimeRange>(
    ItemsTimeRange.short_term
  );
  const [limit, setLimit] = useState<number>(10);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const periodLabel = {
    [ItemsTimeRange.short_term]: "último mês",
    [ItemsTimeRange.medium_term]: "últimos 6 meses",
    [ItemsTimeRange.long_term]: "último ano",
  }[timeRange];

  useEffect(() => {
    const fetchUserData = async (token: string) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await getUserTopItemsTracks(token, timeRange, limit);
        setTracks(data.items || []);
      } catch (error) {
        setTracks([]);
        setErrorMessage(
          "Não foi possível carregar as músicas mais ouvidas dessa conta."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData(token);
  }, [timeRange, limit, token]);

  if (isLoading && tracks.length === 0) return <Loading />;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-green-400">
            Top Spotify
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Suas músicas mais ouvidas
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {tracks.length} faixas no ranking de {periodLabel}.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
        <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-8 text-center text-gray-400">
          Nenhuma faixa encontrada para esse período. Tente selecionar 6 meses
          ou 1 ano.
        </div>
      )}

      {!isLoading && !errorMessage && tracks.length > 0 && (
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
    </section>
  );
}
