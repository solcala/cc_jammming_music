import React from 'react';
import type { Track as TrackType } from '../types/spotify';
import styles from './Track.module.css';

export interface TrackProps {
  track: TrackType;
  addRemoveTrack: boolean;
  addToPlaylist: (track: TrackType) => void;
  removeFromPlaylist: (track: TrackType) => void;
}

function Track({
  track,
  addRemoveTrack,
  addToPlaylist,
  removeFromPlaylist,
}: TrackProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (addRemoveTrack) {
      addToPlaylist(track);
    } else {
      removeFromPlaylist(track);
    }
  };

  const trackId = track.id || 'unknown';

  return (
    <div className={styles.Track} data-testid={`track-item-${trackId}`}>
      <div>
        <h3 data-testid={`track-name-${trackId}`}>{track.name}</h3>
        <p data-testid={`track-artist-${trackId}`}>{track.artist}</p>
      </div>
      <button
        onClick={handleClick}
        data-testid={
          addRemoveTrack ? `track-add-${trackId}` : `track-remove-${trackId}`
        }
      >
        {addRemoveTrack ? '+' : '-'}
      </button>
    </div>
  );
}

export default Track;
