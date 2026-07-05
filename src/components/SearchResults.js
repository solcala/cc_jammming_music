import React from 'react';
import styles from './SearchResults.module.css';
import Tracklist from './Tracklist';

function SearchResults({ results, addToPlaylist, hasSearched = false }) {
  const addRemoveTrack = true;
  const showEmptyState = hasSearched && results.length === 0;

  return (
    <div className={styles.searchResults}>
      <h2>Results</h2>
      {showEmptyState ? (
        <p data-testid="search-empty-message">No results found</p>
      ) : (
        <Tracklist
          tracks={results}
          addRemoveTrack={addRemoveTrack}
          addToPlaylist={addToPlaylist}
        />
      )}
    </div>
  );
}

export default SearchResults;
