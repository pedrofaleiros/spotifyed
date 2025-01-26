import { TrackObject } from "@/services/itemsService";

interface TrackComponentProps {
  track: TrackObject;
  index: number;
}

export default function TrackComponent({ track, index }: TrackComponentProps) {
  return (
    <div
      key={track.id}
      className=" relative pt-0 active:pt-96 rounded-md overflow-hidden shadow-md"
      style={{
        backgroundImage: `url(${track.album.images[0].url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative flex flex-col justify-center h-full p-2 gap-1">
        <span className="font-semibold text-base text-gray-100  bg-gray-800 bg-opacity-60 w-fit px-2 rounded-sm">
          #{index + 1} - {track.name}
        </span>
        <span className="text-base font-medium text-gray-300  bg-gray-800 bg-opacity-60 w-fit px-2 rounded-sm">
          {track.artists[0].name}
        </span>
      </div>
    </div>
  );
}
/* 
<div
      key={track.id}
      className="relative h-32 active:h-full rounded-md overflow-hidden shadow-md"
    >
      <img
        src={track.album.images[0].url}
        alt={track.name}
        className="w-full h-full object-cover object-center"
      />

      <div className="absolute inset-0 flex flex-col justify-end p-2 gap-1">
        <span className="font-semibold text-base text-gray-100 bg-gray-800 bg-opacity-60 w-fit px-2 rounded-sm">
          #{index + 1} - {track.name}
        </span>
        <span className="text-base font-medium text-gray-300 bg-gray-800 bg-opacity-60 w-fit px-2 rounded-sm">
          {track.artists[0].name} - {track.album.name}
        </span>
      </div>
    </div>
*/
