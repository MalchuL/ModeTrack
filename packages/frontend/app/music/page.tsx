"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlaylistByContext } from "@/hooks/use-playlists";
import { PlaylistContext } from "@/types/playlist";
import { TrackList } from "@/components/music/playlist-manager";

export default function MusicPage() {
  const { data: workPlaylist, isLoading: isLoadingWork } = usePlaylistByContext(PlaylistContext.WORK);
  const { data: breakPlaylist, isLoading: isLoadingBreak } = usePlaylistByContext(PlaylistContext.BREAK);

  return (
    <main className="container max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Music & Playlists</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
           <h2 className="text-xl font-semibold flex items-center gap-2">
             <span className="w-3 h-3 rounded-full bg-primary" /> Work Playlist
           </h2>
           <TrackList playlist={workPlaylist} isLoading={isLoadingWork} />
        </div>

        <div className="space-y-4">
           <h2 className="text-xl font-semibold flex items-center gap-2">
             <span className="w-3 h-3 rounded-full bg-green-500" /> Break Playlist
           </h2>
           <TrackList playlist={breakPlaylist} isLoading={isLoadingBreak} />
        </div>
      </div>
    </main>
  );
}

