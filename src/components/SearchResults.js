import React from 'react';
import styles from './SearchResults.module.css';
import Tracklist from './Tracklist';

function SearchResults({ results, addToPlaylist }) {
  const addRemoveTrack = true;
  return (
    <div className={styles.searchResults}>
      <h2>Results</h2>
      <Tracklist
        tracks={results}
        addRemoveTrack={addRemoveTrack}
        addToPlaylist={addToPlaylist} />
    </div>
  )
}

export default SearchResults;
