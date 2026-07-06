import React, { useState } from 'react';
import styles from './SearchBar.module.css';

function SearchBar({ search, searchBy, setSearchBy, isSearching = false }) {
  const [searchError, setSearchError] = useState('');

  const onChangeSearchBy = (e) => {
    setSearchBy(e.target.value);
    if (searchError) {
      setSearchError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchBy === '') {
      setSearchError('Please enter a song title');
      return;
    }
    setSearchError('');
    search();
  };

  return (
    <form className={styles.searchBar} onSubmit={handleSubmit} data-testid="search-form">
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
        type="submit"
        data-testid="search-button"
        disabled={isSearching}
      >
        {isSearching ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}

export default SearchBar;
