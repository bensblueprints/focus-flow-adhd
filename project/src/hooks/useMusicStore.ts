import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Howl } from 'howler';
import { CURATED_TRACKS } from '../data/music';

interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  isCurated?: boolean;
}

interface Track {
  id: string;
  name: string;
  url: string;
  duration: number;
}

interface MusicState {
  playlists: Playlist[];
  currentPlaylist: string | null;
  currentTrack: string | null;
  isPlaying: boolean;
  volume: number;
  howl: Howl | null;
  
  // Playlist operations
  addPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Omit<Track, 'id'>) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  
  // Playback controls
  play: (playlistId: string, trackId: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  next: () => void;
  previous: () => void;
  
  // Initialize curated playlists
  initializeCuratedPlaylists: () => void;
}

const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      playlists: [],
      currentPlaylist: null,
      currentTrack: null,
      isPlaying: false,
      volume: 0.5,
      howl: null,
      
      initializeCuratedPlaylists: () => {
        const curatedPlaylists = Object.entries(CURATED_TRACKS).map(([name, tracks]) => ({
          id: uuidv4(),
          name,
          tracks,
          isCurated: true
        }));
        
        set((state) => ({
          playlists: [...curatedPlaylists, ...state.playlists.filter(p => !p.isCurated)]
        }));
      },
      
      addPlaylist: (name) => set((state) => ({
        playlists: [...state.playlists, { id: uuidv4(), name, tracks: [] }]
      })),
      
      deletePlaylist: (id) => set((state) => ({
        playlists: state.playlists.filter(playlist => playlist.id !== id || playlist.isCurated)
      })),
      
      addTrackToPlaylist: (playlistId, track) => set((state) => ({
        playlists: state.playlists.map(playlist => 
          playlist.id === playlistId && !playlist.isCurated
            ? { ...playlist, tracks: [...playlist.tracks, { ...track, id: uuidv4() }] }
            : playlist
        )
      })),
      
      removeTrackFromPlaylist: (playlistId, trackId) => set((state) => ({
        playlists: state.playlists.map(playlist => 
          playlist.id === playlistId && !playlist.isCurated
            ? { ...playlist, tracks: playlist.tracks.filter(track => track.id !== trackId) }
            : playlist
        )
      })),
      
      play: (playlistId, trackId) => {
        const state = get();
        const playlist = state.playlists.find(p => p.id === playlistId);
        const track = playlist?.tracks.find(t => t.id === trackId);
        
        if (!track) return;
        
        // Stop current track if playing
        if (state.howl) {
          state.howl.stop();
        }
        
        // Create new Howl instance
        const howl = new Howl({
          src: [track.url],
          volume: state.volume,
          onend: () => {
            get().next();
          }
        });
        
        howl.play();
        
        set({
          currentPlaylist: playlistId,
          currentTrack: trackId,
          isPlaying: true,
          howl
        });
      },
      
      pause: () => {
        const { howl } = get();
        if (howl) {
          howl.pause();
          set({ isPlaying: false });
        }
      },
      
      resume: () => {
        const { howl } = get();
        if (howl) {
          howl.play();
          set({ isPlaying: true });
        }
      },
      
      stop: () => {
        const { howl } = get();
        if (howl) {
          howl.stop();
          set({
            isPlaying: false,
            currentTrack: null,
            currentPlaylist: null,
            howl: null
          });
        }
      },
      
      setVolume: (volume) => {
        const { howl } = get();
        if (howl) {
          howl.volume(volume);
        }
        set({ volume });
      },
      
      next: () => {
        const state = get();
        const playlist = state.playlists.find(p => p.id === state.currentPlaylist);
        if (!playlist) return;
        
        const currentIndex = playlist.tracks.findIndex(t => t.id === state.currentTrack);
        const nextTrack = playlist.tracks[currentIndex + 1];
        
        if (nextTrack) {
          state.play(playlist.id, nextTrack.id);
        } else {
          state.stop();
        }
      },
      
      previous: () => {
        const state = get();
        const playlist = state.playlists.find(p => p.id === state.currentPlaylist);
        if (!playlist) return;
        
        const currentIndex = playlist.tracks.findIndex(t => t.id === state.currentTrack);
        const previousTrack = playlist.tracks[currentIndex - 1];
        
        if (previousTrack) {
          state.play(playlist.id, previousTrack.id);
        }
      }
    }),
    {
      name: 'focus-flow-music',
      partialize: (state) => ({
        playlists: state.playlists,
        currentPlaylist: state.currentPlaylist,
        currentTrack: state.currentTrack,
        isPlaying: state.isPlaying,
        volume: state.volume,
      })
    }
  )
);

export default useMusicStore;