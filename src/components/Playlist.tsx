import React, { useState } from 'react';
import type { Track } from '../types/spotify';
import Tracklist from './Tracklist';
import styles from './Playlist.module.css';

export interface PlaylistProps {
  playlistTracks: Track[];
  removeFromPlaylist: (track: Track) => void;
  savePlaylist: () => void;
  playlistName: string;
  setPlaylistName: (name: string) => void;
  addMessage: (msg?: string) => void;
  message: string;
  isSaving?: boolean;
}

function Playlist({
  playlistTracks,
  removeFromPlaylist,
  savePlaylist,
  playlistName,
  setPlaylistName,
  addMessage,
  message,
  isSaving = false,
}: PlaylistProps) {
  const [validationError, setValidationError] = useState('');
  const addRemoveTrack = false;

  const handlePlaylistName = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setPlaylistName(e.target.value);
    setValidationError('');
    addMessage('');
  };

  const handleSubmitSavePlaylist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (playlistName === '') {
      setValidationError('Add a playlist title');
      return;
    }
    if (playlistTracks.length === 0) {
      setValidationError('Add at least a track to the playlist');
      return;
    }
    setValidationError('');
    savePlaylist();
  };

  return (
    <div
      className={styles.playlist}
      id="playlist-section"
      data-testid="playlist-section"
    >
      <p
        id="message"
        data-testid="playlist-message"
        role="status"
        aria-live="polite"
      >
        {message}
      </p>
      <input
        aria-label="playlist-title"
        className={styles.playlistName}
        id="playlist-title"
        data-testid="playlist-title-input"
        onChange={handlePlaylistName}
        value={playlistName}
        type="text"
        placeholder="Add a playlist title"
      />
      <Tracklist
        tracks={playlistTracks}
        removeFromPlaylist={removeFromPlaylist}
        addRemoveTrack={addRemoveTrack}
        addToPlaylist={() => {}}
      />
      {validationError && (
        <p
          className={styles.error}
          role="alert"
          data-testid="playlist-validation-error"
        >
          {validationError}
        </p>
      )}
      <button
        id="save-spotify-btn"
        className={styles.Button}
        type="button"
        data-testid="save-playlist-button"
        onClick={handleSubmitSavePlaylist}
        disabled={isSaving || playlistTracks.length === 0}
      >
        {isSaving ? 'Saving...' : 'Save to Spotify'}
      </button>
    </div>
  );
}

export default Playlist;
