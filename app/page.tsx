import MusicPlayer from "@/components/MusicPlayer";
import tracksData from "@/data/tracks.json";

export default function Page() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-between overflow-hidden">
      <MusicPlayer data={tracksData} />
    </main>
  );
}
