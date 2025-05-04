import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Plus, Trash2, Music, Lock } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import useMusicStore from '../../hooks/useMusicStore';

interface MusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ isOpen, onClose }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [newPlaylistName, setNewPlaylistName] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  
  const {
    playlists,
    currentPlaylist,
    currentTrack,
    isPlaying,
    volume,
    initializeCuratedPlaylists,
    addPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    play,
    pause,
    resume,
    setVolume,
    next,
    previous
  } = useMusicStore();
  
  useEffect(() => {
    initializeCuratedPlaylists();
  }, [initializeCuratedPlaylists]);
  
  useEffect(() => {
    if (waveformRef.current && !wavesurfer.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4B5563',
        progressColor: '#3B82F6',
        cursorColor: '#3B82F6',
        barWidth: 2,
        barRadius: 3,
        responsive: true,
        height: 60,
        normalize: true,
        partialRender: true,
      });
    }
    
    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
    };
  }, []);
  
  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      addPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
    }
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      if (wavesurfer.current) {
        const url = URL.createObjectURL(file);
        wavesurfer.current.load(url);
      }
    }
  };
  
  const handleAddTrack = async (playlistId: string) => {
    if (!selectedFile) return;
    
    const url = URL.createObjectURL(selectedFile);
    const audio = new Audio();
    audio.src = url;
    
    await new Promise((resolve) => {
      audio.addEventListener('loadedmetadata', () => {
        addTrackToPlaylist(playlistId, {
          name: selectedFile.name,
          url,
          duration: Math.round(audio.duration)
        });
        resolve(null);
      });
    });
    
    setSelectedFile(null);
    if (wavesurfer.current) {
      wavesurfer.current.empty();
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
      <motion.div
        className="relative w-full max-w-lg rounded-lg bg-white shadow-xl dark:bg-gray-800"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Music Player</h2>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:hover:bg-gray-700"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="max-h-[calc(100vh-16rem)] overflow-y-auto p-4">
          <div className="mb-4">
            <div className="mb-3 flex items-center gap-2">
              <input
                type="text"
                className="input flex-1"
                placeholder="New playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
              />
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-primary-500 px-3 py-2 text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                onClick={handleCreatePlaylist}
              >
                <Plus className="-ml-1 mr-2 h-4 w-4" />
                Create
              </button>
            </div>
            
            <div className="mb-4">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="block w-full rounded-lg border border-gray-300 text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100 dark:border-gray-600 dark:text-gray-400 dark:file:bg-primary-900/10 dark:file:text-primary-400"
              />
              <div ref={waveformRef} className="mt-4" />
            </div>
          </div>
          
          <div className="space-y-3">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">{playlist.name}</h3>
                    {playlist.isCurated && (
                      <span className="flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
                        <Lock className="mr-1 h-3 w-3" />
                        Curated
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!playlist.isCurated && (
                      <>
                        {selectedFile && (
                          <button
                            type="button"
                            className="rounded-md bg-primary-500 px-2 py-1 text-xs font-medium text-white hover:bg-primary-600"
                            onClick={() => handleAddTrack(playlist.id)}
                          >
                            Add Track
                          </button>
                        )}
                        <button
                          type="button"
                          className="rounded-md p-1 text-gray-400 hover:bg-red-100 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                          onClick={() => deletePlaylist(playlist.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  {playlist.tracks.map((track) => (
                    <div
                      key={track.id}
                      className={`flex items-center justify-between rounded-md p-2 ${
                        currentTrack === track.id
                          ? 'bg-primary-50 dark:bg-primary-900/10'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                          onClick={() => {
                            if (currentTrack === track.id && isPlaying) {
                              pause();
                            } else if (currentTrack === track.id) {
                              resume();
                            } else {
                              play(playlist.id, track.id);
                            }
                          }}
                        >
                          {currentTrack === track.id && isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                        <span className="text-sm text-gray-900 dark:text-white">{track.name}</span>
                      </div>
                      {!playlist.isCurated && (
                        <button
                          type="button"
                          className="rounded-md p-1 text-gray-400 hover:bg-red-100 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                          onClick={() => removeTrackFromPlaylist(playlist.id, track.id)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {playlist.tracks.length === 0 && (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                      No tracks in this playlist
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {playlists.length === 0 && (
            <div className="text-center">
              <Music className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No playlists</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating a new playlist
              </p>
            </div>
          )}
        </div>
        
        {currentTrack && (
          <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  onClick={previous}
                >
                  <SkipBack className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  onClick={isPlaying ? pause : resume}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  onClick={next}
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="h-1.5 w-20 cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                />
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MusicPlayer;