import { TrackObject } from "@/services/itemsService";

interface TrackComponentProps {
  track: TrackObject;
  index: number;
}

export default function TrackComponent({ track, index }: TrackComponentProps) {
  const albumImage = track.album.images[0]?.url;
  const artists = track.artists.map((artist) => artist.name).join(", ");
  const releaseYear = track.album.release_date?.slice(0, 4);
  const popularity = Math.max(0, Math.min(track.popularity, 100));
  const primaryArtistUrl =
    track.artists[0]?.external_urls.spotify || track.external_urls.spotify;

  return (
    <article className="group grid grid-cols-[2.5rem_4rem_minmax(0,1fr)] items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 transition hover:border-green-400/50 hover:bg-white/[0.07] sm:grid-cols-[3rem_4.5rem_minmax(0,1.25fr)_minmax(0,1fr)_7rem]">
      <div className="text-center font-semibold tabular-nums text-gray-400">
        #{index + 1}
      </div>

      {albumImage ? (
        <img
          alt={`Capa do álbum ${track.album.name}`}
          className="aspect-square w-16 rounded-md object-cover shadow-lg shadow-black/30 sm:w-[4.5rem]"
          src={albumImage}
        />
      ) : (
        <div className="aspect-square w-16 rounded-md bg-gray-800 sm:w-[4.5rem]" />
      )}

      <div className="min-w-0">
        <a
          className="block truncate text-base font-semibold text-white underline-offset-4 group-hover:text-green-300 group-hover:underline"
          href={track.external_urls.spotify}
          rel="noreferrer"
          target="_blank"
          title={track.name}
        >
          {track.name}
        </a>
        <a
          className="mt-1 block truncate text-sm text-gray-300 hover:text-white"
          href={primaryArtistUrl}
          rel="noreferrer"
          target="_blank"
          title={artists}
        >
          {artists}
        </a>
        <a
          className="mt-1 block truncate text-xs text-gray-500 hover:text-gray-300 sm:hidden"
          href={track.album.external_urls.spotify}
          rel="noreferrer"
          target="_blank"
          title={track.album.name}
        >
          {track.album.name}
        </a>
      </div>

      <a
        className="hidden min-w-0 text-sm text-gray-300 hover:text-white sm:block"
        href={track.album.external_urls.spotify}
        rel="noreferrer"
        target="_blank"
        title={track.album.name}
      >
        <span className="block truncate">{track.album.name}</span>
        {releaseYear && (
          <span className="mt-1 block text-xs text-gray-500">{releaseYear}</span>
        )}
      </a>

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
