import React from 'react';
import type { Track as TrackType } from '../types/spotify';
import Track from './Track';

export interface TracklistProps {
  tracks?: TrackType[];
  addRemoveTrack: boolean;
  addToPlaylist: (track: TrackType) => void;
  removeFromPlaylist: (track: TrackType) => void;
}

function Tracklist({
  tracks,
  removeFromPlaylist,
  addRemoveTrack,
  addToPlaylist,
}: TracklistProps) {
  return (
    <>
      {tracks?.map((song) => (
        <Track
          key={song.id}
          addRemoveTrack={addRemoveTrack}
          track={song}
          removeFromPlaylist={removeFromPlaylist}
          addToPlaylist={addToPlaylist}
        />
      ))}
    </>
  );
}

export default Tracklist;
