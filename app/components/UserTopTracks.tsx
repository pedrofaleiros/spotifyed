import {
  getUserTopItemsTracks,
  ItemsTimeRange,
  TrackObject,
} from "@/services/itemsService";
import { useEffect, useState } from "react";
import styles from "./styles.module.css";
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

  const fetchUserData = async (token: string) => {
    setIsLoading(true);
    try {
      const data = await getUserTopItemsTracks(token, timeRange, limit);
      setTracks(data.items);
    } catch (error) {}

    setIsLoading(false);
  };

  useEffect(() => {
    fetchUserData(token);
  }, [timeRange, limit]);

  if (tracks.length == 0) return <Loading />;

  return (
    <div className="p-2 flex flex-col gap-2">
      <TimeRangeComponent timeRange={timeRange} setTimeRange={setTimeRange} />

      <SetLimitComponent limit={limit} setLimit={setLimit} />

      {isLoading && <Loading />}

      <div className="grid grid-cols-1 gap-2 pt-2">
        {!isLoading &&
          tracks.map((t, i) => (
            <TrackComponent index={i} track={t} key={t.id} />
          ))}
      </div>
    </div>
  );
}

/* 

<div className={styles.wrap}>
        <div className={styles.album}>
          <div
            className={styles.cover}
            style={{
              backgroundImage: `url(${tracks[0].album.images[0].url})`,
            }}
          >
            <div className={styles.print}></div>
          </div>
          <div className={styles.vinyl}>
            <div className={styles.print}></div>
          </div>
        </div>
      </div>

      <div
        style={{
          backgroundImage: `url(${tracks[0].album.images[0].url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          filter: "blur(10px)",
        }}
      />

*/
