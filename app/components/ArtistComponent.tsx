import { TopArtistObject } from "@/services/itemsService";

interface ArtistComponentProps {
  artist: TopArtistObject;
  index: number;
}

export default function ArtistComponent({ artist, index }: ArtistComponentProps) {
  const artistImage = artist.images[0]?.url;
  const genres = artist.genres.slice(0, 3).join(", ") || "Gêneros indisponíveis";
  const popularity = Math.max(0, Math.min(artist.popularity, 100));
  const followers = new Intl.NumberFormat("pt-BR").format(
    artist.followers.total
  );

  return (
    <article className="group grid grid-cols-[2.5rem_4rem_minmax(0,1fr)] items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 transition hover:border-green-400/50 hover:bg-white/[0.07] sm:grid-cols-[3rem_4.5rem_minmax(0,1.25fr)_minmax(0,1fr)_7rem]">
      <div className="text-center font-semibold tabular-nums text-gray-400">
        #{index + 1}
      </div>

      {artistImage ? (
        <img
          alt={`Foto de ${artist.name}`}
          className="aspect-square w-16 rounded-md object-cover shadow-lg shadow-black/30 sm:w-[4.5rem]"
          src={artistImage}
        />
      ) : (
        <div className="aspect-square w-16 rounded-md bg-gray-800 sm:w-[4.5rem]" />
      )}

      <div className="min-w-0">
        <a
          className="block truncate text-base font-semibold text-white underline-offset-4 group-hover:text-green-300 group-hover:underline"
          href={artist.external_urls.spotify}
          rel="noreferrer"
          target="_blank"
          title={artist.name}
        >
          {artist.name}
        </a>
        <p className="mt-1 truncate text-sm text-gray-300" title={genres}>
          {genres}
        </p>
        <p className="mt-1 text-xs text-gray-500 sm:hidden">
          {followers} seguidores
        </p>
      </div>

      <div className="hidden min-w-0 text-sm text-gray-300 sm:block">
        <span className="block truncate">{genres}</span>
        <span className="mt-1 block text-xs text-gray-500">
          {followers} seguidores
        </span>
      </div>

      <div className="hidden sm:block">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
          <span>Popularidade</span>
          <span>{popularity}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-800">
          <div
            className="h-full rounded-full bg-green-400"
            style={{ width: `${popularity}%` }}
          />
        </div>
      </div>
    </article>
  );
}
