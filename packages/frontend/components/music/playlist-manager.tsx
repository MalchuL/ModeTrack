import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Playlist, AudioTrack } from "@/types/playlist";
import { useAddTrack, useRemoveTrack } from "@/hooks/use-playlists";
import { useAudioStore } from "@/stores/audio-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Play, Trash2, Music, FolderOpen } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api";

interface TrackListProps {
  playlist?: Playlist;
  isLoading: boolean;
}

export function TrackList({ playlist, isLoading }: TrackListProps) {
  const removeTrack = useRemoveTrack();
  const { playTrack } = useAudioStore();
  const [isAddOpen, setIsAddOpen] = useState(false);

  if (isLoading) return <LoadingSpinner />;
  if (!playlist) return <div>Playlist not found</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{playlist.name}</h3>
        <Button size="sm" variant="outline" onClick={() => setIsAddOpen(true)}>
          Add Track
        </Button>
      </div>

      {!playlist.tracks.length ? (
        <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground">
          No tracks. Add some music!
        </div>
      ) : (
        <div className="space-y-2">
          {playlist.tracks.map((track) => (
            <div
              key={track.id}
              className="flex items-center justify-between p-3 rounded-md border bg-card hover:shadow-sm group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center text-muted-foreground">
                  <Music className="h-4 w-4" />
                </div>
                <div className="font-medium truncate">{track.title}</div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={() => playTrack(track)}>
                  <Play className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    if (confirm("Remove track?")) {
                      removeTrack.mutate({ playlistId: playlist.id, trackId: track.id });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddTrackModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        playlistId={playlist.id} 
      />
    </div>
  );
}

const trackSchema = z.object({
  title: z.string().min(1, "Title is required"),
  file_path: z.string().min(1, "URL/Path is required"),
  from_local: z.boolean().optional(),
});

type TrackFormValues = z.infer<typeof trackSchema>;

function AddTrackModal({ isOpen, onClose, playlistId }: { isOpen: boolean; onClose: () => void; playlistId: number }) {
  const addTrack = useAddTrack();
  const [localTracks, setLocalTracks] = useState<{ title: string; file_path: string }[]>([]);
  const [isLocalMode, setIsLocalMode] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<TrackFormValues>({
    resolver: zodResolver(trackSchema),
  });

  // Fetch local tracks when modal opens or mode switches
  useEffect(() => {
    if (isOpen && isLocalMode && localTracks.length === 0) {
      api.get("/playlists/local")
        .then(res => setLocalTracks(res.data))
        .catch(err => console.error("Failed to fetch local tracks", err));
    }
  }, [isOpen, isLocalMode, localTracks.length]);

  const onSubmit = async (data: TrackFormValues) => {
    try {
      await addTrack.mutateAsync({
        playlistId,
        track: data,
      });
      reset();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Audio Track">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex justify-center mb-4">
           <div className="flex p-1 bg-secondary rounded-lg">
             <button
               type="button"
               className={`px-3 py-1 text-sm rounded-md transition-all ${!isLocalMode ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
               onClick={() => setIsLocalMode(false)}
             >
               Custom URL
             </button>
             <button
               type="button"
               className={`px-3 py-1 text-sm rounded-md transition-all ${isLocalMode ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
               onClick={() => setIsLocalMode(true)}
             >
               Local Library
             </button>
           </div>
        </div>

        {!isLocalMode ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input {...register("title")} placeholder="Song Title" />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">File URL / Path</label>
              <Input {...register("file_path")} placeholder="https://example.com/song.mp3" />
              {errors.file_path && <p className="text-xs text-destructive">{errors.file_path.message}</p>}
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium">Select from Local Folder</label>
            {localTracks.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 border rounded bg-muted/20">
                No tracks found. Configure <code>MUSIC_DIR</code> in backend settings.
              </div>
            ) : (
              <div className="max-h-[200px] overflow-y-auto border rounded-md">
                {localTracks.map((track) => (
                  <div 
                    key={track.file_path}
                    className="p-2 hover:bg-accent cursor-pointer flex items-center gap-2 text-sm"
                    onClick={() => {
                      setValue("title", track.title);
                      setValue("file_path", track.file_path);
                    }}
                  >
                    <Music className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate">{track.title}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Hidden inputs to store selected values */}
            <div className="p-2 bg-secondary/30 rounded text-xs truncate">
               Selected: {watch("title") || "None"}
            </div>
            <input type="hidden" {...register("title")} />
            <input type="hidden" {...register("file_path")} />
            {errors.file_path && <p className="text-xs text-destructive">Please select a track</p>}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
           <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
           <Button type="submit" disabled={isSubmitting}>Add Track</Button>
        </div>
      </form>
    </Modal>
  );
}
