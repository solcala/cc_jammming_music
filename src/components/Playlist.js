import React, { useState } from 'react';
import Tracklist from './Tracklist';
import styles from './Playlist.module.css';

function Playlist({
    playlistTracks,
    removeFromPlaylist,
    savePlaylist,
    playlistName,
    setPlaylistName,
    addMessage,
    message,
    isSaving = false,
}) {
    const [validationError, setValidationError] = useState('');
    const addRemoveTrack = false;
    const handlePlaylistName = (e) => {
        e.preventDefault();
        setPlaylistName(e.target.value);
        setValidationError('');
        // If name changes and there was a msg, this clears it since it's going to create a new playlist - no update implemented yet
        addMessage("");
    };

    const handleSubmitSavePlaylist = (e) => {
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
    }

    return (
        <div className={styles.playlist} id="playlist-section" data-testid="playlist-section">
            <p id="message" data-testid="playlist-message" role="status" aria-live="polite">{message}</p>
            <input
                aria-label="playlist-title"
                className={styles.playlistName}
                id="playlist-title"
                data-testid="playlist-title-input"
                onChange={handlePlaylistName}
                value={playlistName}
                type="text"
                placeholder="Add a playlist title" />
            <Tracklist
                tracks={playlistTracks}
                removeFromPlaylist={removeFromPlaylist}
                addRemoveTrack={addRemoveTrack} />
            {validationError && (
                <p className={styles.error} role="alert" data-testid="playlist-validation-error">
                    {validationError}
                </p>
            )}
            <button id="save-spotify-btn"
                className={styles.Button}
                type="button"
                data-testid="save-playlist-button"
                onClick={handleSubmitSavePlaylist}
                disabled={isSaving || playlistTracks.length === 0}>
                {isSaving ? 'Saving...' : 'Save to Spotify'}
            </button>
        </div>
    )
}

export default Playlist;
