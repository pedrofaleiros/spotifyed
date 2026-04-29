import {
  getUserTopItemsArtists,
  getUserTopItemsTracks,
  ItemsTimeRange,
  itemsTimeRangeLabels,
  TopArtistObject,
  TrackObject,
} from "@/services/itemsService";
import { useEffect, useMemo, useState } from "react";
import Loading from "./Loading";
import { SetLimitComponent } from "./SetLimitComponent";
import TimeRangeComponent from "./TimeRangeComponent";

interface SummaryDashboardProps {
  token: string;
}

interface SummaryMetric {
  label: string;
  value: string;
  detail: string;
}

function getMostFrequent(values: string[]): { value: string; count: number } | null {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    if (!value) return;
    counts.set(value, (counts.get(value) || 0) + 1);
  });

  const [first] = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return first ? { value: first[0], count: first[1] } : null;
}

function buildSummaryMetrics(
  tracks: TrackObject[],
  artists: TopArtistObject[]
): SummaryMetric[] {
  const recurringArtist = getMostFrequent(
    tracks.flatMap((track) => track.artists.map((artist) => artist.name))
  );
  const recurringAlbum = getMostFrequent(
    tracks.map((track) => track.album.name)
  );
  const recurringYear = getMostFrequent(
    tracks
      .map((track) => track.album.release_date?.slice(0, 4))
      .filter(Boolean) as string[]
  );
  const topGenres = [...new Set(artists.flatMap((artist) => artist.genres))]
    .slice(0, 3)
    .join(", ");
  const averagePopularity =
    tracks.length > 0
      ? Math.round(
          tracks.reduce((sum, track) => sum + track.popularity, 0) /
            tracks.length
        )
      : 0;

  return [
    {
      label: "Artista mais presente",
      value: recurringArtist?.value || "Sem dados",
      detail: recurringArtist
        ? `${recurringArtist.count} aparições entre as faixas`
        : "Nenhuma faixa analisada",
    },
    {
      label: "Artista #1",
      value: artists[0]?.name || "Sem dados",
      detail: artists[0]?.genres.slice(0, 2).join(", ") || "Ranking vazio",
    },
    {
      label: "Álbum recorrente",
      value: recurringAlbum?.value || "Sem dados",
      detail: recurringAlbum
        ? `${recurringAlbum.count} faixa(s) no recorte`
        : "Nenhum álbum encontrado",
    },
    {
      label: "Ano predominante",
      value: recurringYear?.value || "Sem dados",
      detail: recurringYear
        ? `${recurringYear.count} lançamento(s)`
        : "Datas indisponíveis",
    },
    {
      label: "Popularidade média",
      value: `${averagePopularity}%`,
      detail: `${tracks.length} faixa(s) calculadas`,
    },
    {
      label: "Gêneros principais",
      value: topGenres || "Sem dados",
      detail: `${artists.length} artista(s) analisados`,
    },
    {
      label: "Total analisado",
      value: `${tracks.length + artists.length}`,
      detail: `${tracks.length} faixas + ${artists.length} artistas`,
    },
  ];
}

export default function SummaryDashboard({ token }: SummaryDashboardProps) {
  const [tracks, setTracks] = useState<TrackObject[]>([]);
  const [artists, setArtists] = useState<TopArtistObject[]>([]);
  const [timeRange, setTimeRange] = useState<ItemsTimeRange>(
    ItemsTimeRange.short_term
  );
  const [limit, setLimit] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [tracksData, artistsData] = await Promise.all([
          getUserTopItemsTracks(token, timeRange, limit),
          getUserTopItemsArtists(token, timeRange, limit),
        ]);

        setTracks(tracksData.items || []);
        setArtists(artistsData.items || []);
      } catch (error) {
        setTracks([]);
        setArtists([]);
        setErrorMessage("Não foi possível carregar o resumo dessa conta.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [token, timeRange, limit]);

  const metrics = useMemo(
    () => buildSummaryMetrics(tracks, artists),
    [tracks, artists]
  );

  if (isLoading && tracks.length === 0 && artists.length === 0) {
    return <Loading />;
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-green-400">
            Resumo Spotify
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Seu retrato musical
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Análise do {itemsTimeRangeLabels[timeRange]} com até {limit} itens
            por ranking.
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
          Atualizando resumo...
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-8 text-center text-red-100">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && tracks.length === 0 && artists.length === 0 && (
        <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-8 text-center text-gray-400">
          Nenhum dado encontrado para esse período. Tente selecionar 6 meses ou
          1 ano.
        </div>
      )}

      {!errorMessage && (tracks.length > 0 || artists.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric) => (
            <article
              className="rounded-lg border border-white/10 bg-white/[0.04] p-4"
              key={metric.label}
            >
              <p className="text-xs font-semibold uppercase text-gray-500">
                {metric.label}
              </p>
              <h3 className="mt-3 truncate text-xl font-bold text-white">
                {metric.value}
              </h3>
              <p className="mt-2 text-sm text-gray-400">{metric.detail}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
