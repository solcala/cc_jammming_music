import React from 'react';
import './Playlist.module.css'
import Tracklist from './Tracklist';
import styles from './Playlist.module.css';

function Playlist({ playlistTracks, removeFromPlaylist, savePlaylist, playlistName, setPlaylistName, addMessage, message }) {

    const addRemoveTrack = false;
    const handlePlaylistName = (e) => {
        e.preventDefault();
        setPlaylistName(e.target.value);
        // If name changes and there was a msg, this clears it since it's going to create a new playlist - no update implemented yet
        addMessage("");
    };

    const handleSubmitSavePlaylist = (e) => {
        e.preventDefault();
        if (playlistName === '') {
            return alert('Add a playlist title');
        }
        if (playlistTracks.length == 0) {
            return alert('Add at least a track to the playlist');
        }
        savePlaylist();
    }

    return (
        <div className={styles.playlist} id="playlist-section" data-testid="playlist-section">
            <p id='message' data-testid="playlist-message">{message}</p>
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
            <button id="save-spotify-btn"
                className={styles.Button}
                type="button"
                data-testid="save-playlist-button"
                onClick={handleSubmitSavePlaylist}>Save to Spotify</button>
        </div>
    )
}

export default Playlist;
