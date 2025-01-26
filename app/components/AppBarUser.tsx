import { SpotifyUserProfile } from "@/services/userServices";

interface AppBarUserProps {
  userData: SpotifyUserProfile;
  onLogout: () => void;
}

export default function AppBarUser({ userData, onLogout }: AppBarUserProps) {
  return (
    <div className="flex flex-row bg-gray-900 bg-opacity-75 w-full justify-between p-4 items-center">
      <div className="flex flex-row gap-2">
        {userData.images.length > 0 && (
          <img className="size-12 rounded-full" src={userData.images[0].url} />
        )}

        <div>
          <h1 className="text-base font-medium"> {userData.display_name} </h1>
          <h1 className="text-base text-gray-400"> {userData.email} </h1>
        </div>
      </div>
      <button
        className="text-green-500 font-medium text-base hover:text-green-400"
        onClick={onLogout}
      >
        Sair
      </button>
    </div>
  );
}
