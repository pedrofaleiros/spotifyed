"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile, SpotifyUserProfile } from "@/services/userServices";
import Loading from "../components/Loading";
import AppBarUser from "../components/AppBarUser";
import UserTopTracks from "../components/UserTopTracks";

export default function Home() {
  const [userData, setUserData] = useState<SpotifyUserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/");
  };

  useEffect(() => {
    const fetchUserData = async (token: string) => {
      try {
        const data = await getUserProfile(token, router);
        setUserData(data);
      } catch (_) {
        router.push("/");
      }
    };

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      const expiresIn = localStorage.getItem("expires_in");

      if (!token || Date.now() > Number(expiresIn)) {
        router.push("/");
        return;
      }

      setAccessToken(token);
      fetchUserData(token);
    }
  }, [router]);

  if (!userData || !accessToken) return <Loading />;

  return (
    <div>
      <AppBarUser userData={userData} onLogout={handleLogout} />

      <UserTopTracks token={accessToken} />
    </div>
  );
}
