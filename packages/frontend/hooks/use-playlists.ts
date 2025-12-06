import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Playlist, AudioTrack, AudioTrackCreate, TrackReorder, PlaylistContext } from "@/types/playlist";
import { toast } from "@/components/ui/toast";

export const playlistKeys = {
  all: ["playlists"] as const,
  list: () => [...playlistKeys.all, "list"] as const,
  detail: (id: number) => [...playlistKeys.all, "detail", id] as const,
  context: (context: string) => [...playlistKeys.all, "context", context] as const,
};

const fetchPlaylists = async () => {
  const { data } = await api.get<Playlist[]>("/playlists");
  return data;
};

const fetchPlaylistByContext = async (context: PlaylistContext) => {
  const { data } = await api.get<Playlist>(`/playlists/context/${context}`);
  return data;
};

const addTrack = async ({ playlistId, track }: { playlistId: number; track: AudioTrackCreate }) => {
  const { data } = await api.post<AudioTrack>(`/playlists/${playlistId}/tracks`, track);
  return data;
};

const removeTrack = async ({ playlistId, trackId }: { playlistId: number; trackId: number }) => {
  await api.delete(`/playlists/${playlistId}/tracks/${trackId}`);
};

const reorderTrack = async ({ playlistId, reorder }: { playlistId: number; reorder: TrackReorder }) => {
  await api.put(`/playlists/${playlistId}/tracks/reorder`, reorder);
};

export function usePlaylists() {
  return useQuery({
    queryKey: playlistKeys.list(),
    queryFn: fetchPlaylists,
  });
}

export function usePlaylistByContext(context: PlaylistContext) {
  return useQuery({
    queryKey: playlistKeys.context(context),
    queryFn: () => fetchPlaylistByContext(context),
  });
}

export function useAddTrack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addTrack,
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.all }); // simpler to invalidate all for now
      toast.success("Track added");
    },
  });
}

export function useRemoveTrack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeTrack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.all });
      toast.success("Track removed");
    },
  });
}

export function useReorderTrack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderTrack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.all });
    },
  });
}

