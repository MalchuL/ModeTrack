export enum PlaylistContext {
  WORK = "work",
  BREAK = "break",
}

export interface AudioTrack {
  id: number;
  playlist_id: number;
  title: string;
  file_path: string; // URL or path
  duration?: number;
  position: number;
  created_at: string;
}

export interface AudioTrackCreate {
  title: string;
  file_path: string;
  duration?: number;
}

export interface TrackReorder {
  track_id: number;
  new_position: number;
}

export interface Playlist {
  id: number;
  name: string;
  context: PlaylistContext;
  tracks: AudioTrack[];
  created_at: string;
  updated_at: string;
}

