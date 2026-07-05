import React, { useState } from 'react';
import styles from './SearchBar.module.css';

function SearchBar({ search, searchBy, setSearchBy, isSearching = false }) {
  const [searchError, setSearchError] = useState('');

  const onChangeSearchBy = (e) => {
    e.preventDefault();
    setSearchBy(e.target.value);
    if (searchError) {
      setSearchError('');
    }
  };

  const handleSearchClick = (e) => {
    e.preventDefault();
    if (searchBy === '') {
      setSearchError('Please enter a song title');
      return;
    }
    setSearchError('');
    search();
  };

  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        placeholder="Enter a song title"
        onChange={onChangeSearchBy}
        value={searchBy}
        data-testid="search-by-input"
      />
      {searchError && (
        <p className={styles.error} role="alert" data-testid="search-error">
          {searchError}
        </p>
      )}
      <button
        className={styles.searchBtn}
        type="button"
        onClick={handleSearchClick}
        data-testid="search-button"
        disabled={isSearching}
      >
        {isSearching ? 'Searching...' : 'Search'}
      </button>
    </div>
  );
}

export default SearchBar;
