export interface Track {
  id: string;
  title: string;
  artist: string | null;
  album: string | null;
  duration_seconds: number | null;
  source: "upload" | "youtube";
  source_url: string | null;
  status: "pending" | "downloading" | "ready" | "error";
  error_message: string | null;
  file_size_bytes: number | null;
  created_at: string;
}

export interface DiscTrack {
  id: string;
  disc_id: string;
  track_id: string;
  position: number;
  track: Track;
}

export interface Disc {
  id: string;
  name: string;
  format: "audio" | "mp3";
  capacity_seconds: number;
  cover_image_path: string | null;
  tracks: DiscTrack[];
  created_at: string;
  updated_at: string;
}

export interface BurnJob {
  id: string;
  disc_id: string;
  status: "queued" | "awaiting_disc" | "burning" | "done" | "error";
  progress_percent: number;
  log_output: string | null;
  error_message: string | null;
  created_at: string;
  finished_at: string | null;
}
