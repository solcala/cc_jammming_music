import React from 'react';
import type { Track } from '../types/spotify';
import styles from './SearchResults.module.css';
import Tracklist from './Tracklist';

export interface SearchResultsProps {
  results: Track[];
  addToPlaylist: (track: Track) => void;
  hasSearched?: boolean;
}

function SearchResults({
  results,
  addToPlaylist,
  hasSearched = false,
}: SearchResultsProps) {
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
          removeFromPlaylist={() => {}}
        />
      )}
    </div>
  );
}

export default SearchResults;
