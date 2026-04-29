"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile, SpotifyUserProfile } from "@/services/userServices";
import Loading from "../components/Loading";
import AppBarUser from "../components/AppBarUser";
import SummaryDashboard from "../components/SummaryDashboard";
import {
  clearStoredAuth,
  getStoredAuth,
  markLogoutIntent,
} from "../authStorage";

export default function SummaryPage() {
  const [userData, setUserData] = useState<SpotifyUserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();

  const clearAuth = () => {
    clearStoredAuth();
  };

  const handleLogout = () => {
    clearAuth();
    markLogoutIntent();
    setUserData(null);
    setAccessToken(null);
    router.replace("/");
  };

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async (token: string) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await getUserProfile(token);
        if (!isMounted) return;

        setUserData(data);
        setAccessToken(token);
      } catch (error) {
        clearAuth();
        if (!isMounted) return;

        setUserData(null);
        setAccessToken(null);
        setErrorMessage("Não foi possível carregar seu perfil do Spotify.");
        router.replace("/");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const storedAuth = getStoredAuth();

    if (!storedAuth || Date.now() > Number(storedAuth.expiresIn)) {
      clearAuth();
      router.replace("/");
      return;
    }

    fetchUserData(storedAuth.accessToken);

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isLoading) return <Loading />;

  if (errorMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-white">
        <div className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.04] p-6 text-center">
          <p className="text-base font-semibold">{errorMessage}</p>
          <button
            className="mt-4 rounded-md bg-green-400 px-4 py-2 text-sm font-semibold text-gray-950 transition hover:bg-green-300"
            onClick={() => router.replace("/")}
            type="button"
          >
            Entrar novamente
          </button>
        </div>
      </main>
    );
  }

  if (!userData || !accessToken) return null;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <AppBarUser
        userData={userData}
        onLogout={handleLogout}
        activePage="summary"
      />

      <SummaryDashboard token={accessToken} />
    </main>
  );
}
