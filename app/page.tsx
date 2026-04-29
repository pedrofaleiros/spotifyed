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

  const clearAuth = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("expires_in");
  };

  const makeRequestToken = async (refreshToken: string) => {
    try {
      const response = await axios.get(
        `/api/refresh_token?refresh_token=${refreshToken}`
      );

      const { access_token, refresh_token, expires_in } = response.data;

      const expirationTime = Date.now() + parseInt(expires_in) * 1000;
      setCookies(
        access_token,
        refresh_token || refreshToken,
        expirationTime.toString()
      );
      setAccessToken(access_token);
      router.push("/home");
    } catch (_) {
      clearAuth();
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
          clearAuth();
        }
      }

      setIsLoading(false);
    };

    verifyTokens();
  }, []);

  if (isLoading) return <Loading />;

  if (!accessToken) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-400">
                <Image
                  src={SpotifyIcon}
                  alt=""
                  className="size-6"
                  priority
                />
              </div>
              <span className="font-poppins text-lg font-bold">Spotifyed</span>
            </div>
          </header>

          <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_25rem]">
            <div className="max-w-2xl">
              <p className="mb-4 w-fit rounded-md border border-green-400/30 bg-green-400/10 px-3 py-2 text-sm font-semibold text-green-300">
                Conecte sua conta para explorar faixas, artistas, álbuns e
                popularidade.
              </p>
              <h1 className="font-poppins text-4xl font-bold leading-tight text-white sm:text-5xl">
                Veja suas músicas mais ouvidas.
              </h1>

              <button
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg bg-green-400 px-5 py-4 text-base font-bold text-gray-950 shadow-lg shadow-green-950/40 transition hover:bg-green-300 sm:w-fit"
                onClick={handleLogin}
                type="button"
              >
                <Image src={SpotifyIcon} alt="" className="size-6" />
                Entrar com Spotify
              </button>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/30">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Seu top mensal
                  </p>
                  <p className="mt-1 text-xs text-gray-400">Prévia do ranking</p>
                </div>
                <div className="rounded-md bg-green-400 px-2 py-1 text-xs font-bold text-gray-950">
                  Top 10
                </div>
              </div>

              <div className="space-y-3">
                {[
                  ["#1", "Música favorita", "Artista principal", "w-11/12"],
                  ["#2", "Faixa em repetição", "Álbum da semana", "w-9/12"],
                  ["#3", "Descoberta recente", "Novo artista", "w-7/12"],
                ].map(([position, title, subtitle, width]) => (
                  <div
                    className="grid grid-cols-[2.5rem_3.5rem_minmax(0,1fr)] items-center gap-3 rounded-lg bg-gray-900/80 p-3"
                    key={position}
                  >
                    <span className="text-sm font-bold text-gray-400">
                      {position}
                    </span>
                    <div className="aspect-square rounded-md bg-gradient-to-br from-green-300 via-gray-200 to-gray-700" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {title}
                      </p>
                      <p className="mt-1 truncate text-xs text-gray-400">
                        {subtitle}
                      </p>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-800">
                        <div
                          className={`h-full rounded-full bg-green-400 ${width}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return <div></div>;
}
