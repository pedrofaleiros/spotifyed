import { SpotifyUserProfile } from "@/services/userServices";

interface AppBarUserProps {
  userData: SpotifyUserProfile;
  onLogout: () => void;
}

export default function AppBarUser({ userData, onLogout }: AppBarUserProps) {
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
        <button
          className="rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-gray-300 transition hover:border-green-400/50 hover:text-green-300"
          onClick={onLogout}
          type="button"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
