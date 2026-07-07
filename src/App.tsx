import React, { useState, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import Playlist from './components/Playlist';
import Spotify from './util/Spotify';
import type { Track } from './types/spotify';

function App() {
  const [searchBy, setSearchBy] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [message, setMessage] = useState('');
  const [searchApiError, setSearchApiError] = useState('');

  const handleSearchByChange = (value: string) => {
    setSearchBy(value);
    if (searchApiError) {
      setSearchApiError('');
    }
  };

  const clearPlaylist = () => {
    setPlaylistName('');
    setPlaylistTracks([]);
  };

  const addMessage = (msg = 'Playlist created') => {
    setMessage(msg);
  };

  const search = useCallback(() => {
    setIsSearching(true);
    setHasSearched(true);
    setSearchApiError('');
    Spotify.search(searchBy)
      .then((results) => {
        if (results && 'error' in results) {
          setSearchApiError('Unable to search right now. Please try again.');
          setSearchResults([]);
          return;
        }
        setSearchResults(Array.isArray(results) ? results : []);
      })
      .finally(() => setIsSearching(false));
  }, [searchBy]);

  const savePlaylist = useCallback(async () => {
    setIsSaving(true);
    try {
      const uris = playlistTracks.map((song) => song.uri);
      const response = await Spotify.savePlaylist(playlistName, uris);
      if (response === 201) {
        clearPlaylist();
        addMessage();
      } else {
        addMessage('Unable to save playlist. Please try again.');
      }
    } catch (e) {
      console.log('savePlaylist Error catched: ', e);
      addMessage('Unable to save playlist. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [playlistName, playlistTracks]);

  const addToPlaylist = (track: Track) => {
    const result = playlistTracks.find((elem) => elem.id === track.id);
    if (!result) {
      setPlaylistTracks((prev) => [...prev, track]);
      setMessage((current) =>
        current === 'This song is in the playlist.' ? '' : current,
      );
    } else {
      addMessage('This song is in the playlist.');
    }
  };

  const removeFromPlaylist = (trackToRemove: Track) => {
    setPlaylistTracks((prevTracks) =>
      prevTracks.filter((track) => track.id !== trackToRemove.id),
    );
  };

  return (
    <div className="app">
      <Header />
      <SearchBar
        search={search}
        searchBy={searchBy}
        setSearchBy={handleSearchByChange}
        isSearching={isSearching}
      />
      {searchApiError && (
        <p
          className="searchApiError"
          role="alert"
          data-testid="search-api-error"
        >
          {searchApiError}
        </p>
      )}
      <div className="container">
        <SearchResults
          results={searchResults}
          hasSearched={hasSearched}
          addToPlaylist={addToPlaylist}
        />
        <Playlist
          playlistTracks={playlistTracks}
          setPlaylistName={setPlaylistName}
          playlistName={playlistName}
          removeFromPlaylist={removeFromPlaylist}
          savePlaylist={savePlaylist}
          addMessage={addMessage}
          message={message}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}

export default App;
