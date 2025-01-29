"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SpotifyIcon from "../public/icons/spotify.svg";
import Image from "next/image";
import Loading from "./components/Loading";
import axios from "axios";

export default function Home() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const handleLogin = () => {
    if (!isLoading) {
      setIsLoading(true);
      window.location.href = "/api/login";
    }
  };

  const setCookies = (access: string, refresh: string, expires: string) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("expires_in", expires);
  };

  const makeRequestToken = async (refreshToken: string) => {
    try {
      const response = await axios.get(
        `/api/refresh_token?refresh_token=${refreshToken}`
      );

      const { access_token, refresh_token, expires_in } = response.data;

      const expirationTime = Date.now() + parseInt(expires_in) * 1000;
      setCookies(access_token, refresh_token, expirationTime.toString());
      setAccessToken(access_token);
      router.push("/home");
    } catch (_) {
      alert("Erro makeRequestToken");
    }
  };

  useEffect(() => {
    const verifyTokens = async () => {
      const searchParams = new URLSearchParams(window.location.search);

      const token = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");
      const expiresIn = searchParams.get("expires_in");

      if (token && refreshToken && expiresIn) {
        const expirationTime = Date.now() + parseInt(expiresIn) * 1000;

        setCookies(token, refreshToken, expirationTime.toString());
        setAccessToken(token);
        router.push("/home");
      } else {
        const storedAccessToken = localStorage.getItem("access_token");
        const storedRefreshToken = localStorage.getItem("refresh_token");
        const storedExpiresIn = localStorage.getItem("expires_in");

        if (storedAccessToken && storedRefreshToken && storedExpiresIn) {
          if (Date.now() < Number(storedExpiresIn)) {
            setAccessToken(storedAccessToken);
            router.push("/home");
          } else {
            await makeRequestToken(storedRefreshToken);
          }
        } else {
          alert("Faça o login");
        }
      }

      setIsLoading(false);
    };

    verifyTokens();
  }, []);

  if (isLoading) return <Loading />;

  if (!accessToken) {
    return (
      <div className="w-full flex justify-center p-4">
        <button
          className="flex-row flex gap-4 bg-green-500 rounded-full px-4 py-2 items-center text-white hover:bg-green-600 "
          onClick={handleLogin}
        >
          <span className="font-medium text-base">Entrar com Spotify</span>
          <Image src={SpotifyIcon} alt="Spotify icon" />
        </button>
      </div>
    );
  }

  return <div></div>;
}
