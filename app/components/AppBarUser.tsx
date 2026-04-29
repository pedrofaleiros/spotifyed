import { SpotifyUserProfile } from "@/services/userServices";

interface AppBarUserProps {
  userData: SpotifyUserProfile;
  onLogout: () => void;
  activePage?: "ranking" | "summary";
}

export default function AppBarUser({
  userData,
  onLogout,
  activePage = "ranking",
}: AppBarUserProps) {
  const linkClass = (page: "ranking" | "summary") =>
    `rounded-md px-3 py-2 text-sm font-semibold transition ${
      activePage === page
        ? "bg-white text-gray-950"
        : "text-gray-400 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-gray-950/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-row items-center gap-3">
          {userData.images.length > 0 && (
            <img
              alt=""
              className="size-12 flex-none rounded-full object-cover"
              src={userData.images[0].url}
            />
          )}

          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-white">
              {userData.display_name}
            </h1>
            <p className="truncate text-sm text-gray-400">{userData.email}</p>
          </div>
        </div>
        <div className="flex flex-none items-center gap-2">
          <nav
            aria-label="Navegação principal"
            className="hidden rounded-lg border border-white/10 bg-white/[0.04] p-1 sm:flex"
          >
            <a className={linkClass("ranking")} href="/home">
              Ranking
            </a>
            <a className={linkClass("summary")} href="/summary">
              Resumo
            </a>
          </nav>
          <button
            className="rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-gray-300 transition hover:border-green-400/50 hover:text-green-300"
            onClick={onLogout}
            type="button"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
