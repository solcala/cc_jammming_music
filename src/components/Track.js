import React from 'react';
import './Track.module.css';
import styles from './Track.module.css';


function Track({ track, addRemoveTrack, addToPlaylist, removeFromPlaylist }) {

  const handleClick = (e) => {
    e.preventDefault();
    if (addRemoveTrack) {
      addToPlaylist(track);
    } else {
      removeFromPlaylist(track)
    }
  }

  return (
    <div className={styles.Track} data-testid={`track-item-${track.id || 'unknown'}`}>
      <div>
        <h3 data-testid={`track-name-${track.id || 'unknown'}`}>{track.name}</h3>
        <p data-testid={`track-artist-${track.id || 'unknown'}`}>{track.artist}</p>
      </div>
      <button
        onClick={handleClick}
        data-testid={addRemoveTrack ? `track-add-${track.id || 'unknown'}` : `track-remove-${track.id || 'unknown'}`}
      >
        {addRemoveTrack ? '+' : '-'}
      </button>
    </div>
  )
}

export default Track;
