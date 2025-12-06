import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Playlist, AudioTrack } from "@/types/playlist";
import { useAddTrack, useRemoveTrack } from "@/hooks/use-playlists";
import { useAudioStore } from "@/stores/audio-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Trash2, Music } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Modal } from "@/components/ui/modal";

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
});

type TrackFormValues = z.infer<typeof trackSchema>;

function AddTrackModal({ isOpen, onClose, playlistId }: { isOpen: boolean; onClose: () => void; playlistId: number }) {
  const addTrack = useAddTrack();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<TrackFormValues>({
    resolver: zodResolver(trackSchema),
  });

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
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input {...register("title")} placeholder="Song Title" />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">File URL / Path</label>
          <Input {...register("file_path")} placeholder="https://example.com/song.mp3" />
           {errors.file_path && <p className="text-xs text-destructive">{errors.file_path.message}</p>}
           <p className="text-xs text-muted-foreground">
             For this demo, provide a direct URL to an MP3 file.
           </p>
        </div>

        <div className="flex justify-end gap-2 pt-4">
           <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
           <Button type="submit" disabled={isSubmitting}>Add Track</Button>
        </div>
      </form>
    </Modal>
  );
}

