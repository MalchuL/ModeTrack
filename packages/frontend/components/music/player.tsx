"use client";

import { useEffect, useRef, useState } from "react";
import { useAudioStore } from "@/stores/audio-store";
import { useTimerStore } from "@/stores/timer-store";
import { usePlaylistByContext } from "@/hooks/use-playlists";
import { PlaylistContext } from "@/types/playlist";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    currentTrack,
    isPlaying,
    volume,
    isShuffled,
    togglePlay,
    nextTrack,
    prevTrack,
    setVolume,
    toggleShuffle,
    setIsPlaying,
    setQueue,
  } = useAudioStore();

  const { phase } = useTimerStore();
  const prevPhaseRef = useRef(phase);

  // Auto-switch playlist on phase change
  // We need to fetch playlists. This might be better in a separate controller component
  // to avoid mixing data fetching with Player UI.
  // But for simplicity, let's do it here or use a custom hook.
  
  const { data: workPlaylist } = usePlaylistByContext(PlaylistContext.WORK);
  const { data: breakPlaylist } = usePlaylistByContext(PlaylistContext.BREAK);

  useEffect(() => {
    if (prevPhaseRef.current !== phase) {
      // Phase changed
      const isWork = phase === "work";
      const targetPlaylist = isWork ? workPlaylist : breakPlaylist;
      
      if (targetPlaylist && targetPlaylist.tracks.length > 0) {
        setQueue(targetPlaylist.tracks);
        // Optional: Auto-play?
        // setIsPlaying(true); 
      }
      
      prevPhaseRef.current = phase;
    }
  }, [phase, workPlaylist, breakPlaylist, setQueue]);

  // Audio Element Sync
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.file_path;
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrack]); // eslint-disable-line react-hooks/exhaustive-deps

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 shadow-lg z-40">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextTrack}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
      
      <div className="container max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-4">
        {/* Track Info */}
        <div className="flex-1 min-w-0 text-center md:text-left">
          <div className="font-medium truncate">{currentTrack.title}</div>
          <div className="text-xs text-muted-foreground truncate">
            {phase === "work" ? "Work Playlist" : "Break Playlist"}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleShuffle} className={isShuffled ? "text-primary" : "text-muted-foreground"}>
              <Shuffle className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={prevTrack}>
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button size="icon" className="h-10 w-10 rounded-full" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
            </Button>
            
            <Button variant="ghost" size="icon" onClick={nextTrack}>
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Progress */}
          <div className="w-full flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-secondary rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:appearance-none"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 w-32 justify-end">
           <Button variant="ghost" size="icon" onClick={() => setVolume(volume === 0 ? 1 : 0)}>
             {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
           </Button>
           <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-secondary rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:appearance-none"
            />
        </div>
      </div>
    </div>
  );
}

const formatTime = (seconds: number) => {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

