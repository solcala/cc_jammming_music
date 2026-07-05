import React from 'react';
import './App.css';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import Playlist from './components/Playlist';
import Spotify from "./util/Spotify";

import { useState, useCallback } from 'react';

function App() {

  const [searchBy, setSearchBy] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [message, setMessage] = useState("");

  // Spotify Calls
  const search = useCallback(() => {
    setIsSearching(true);
    setHasSearched(true);
    Spotify.search(searchBy)
      .then((results) => setSearchResults(results || []))
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

  // Other functions
  const clearPlaylist = () => {
    setPlaylistName('');
    setPlaylistTracks([]);
  }

  const addMessage = (msg = "Playlist created") => {
    setMessage(msg);
  }

  const addToPlaylist = (track) => {
    let result = playlistTracks.find(elem => elem.id === track.id);
    if (!result) {
      setPlaylistTracks((prev) => [...prev, track]);
    } else {
      addMessage('This song is in the playlist.');
    }

  };

  const removeFromPlaylist = (trackToRemove) => {
    setPlaylistTracks((prevTracks) => prevTracks.filter((track) => track.id !== trackToRemove.id));
  }

  return (
    <div className="app">
      <Header />
      <SearchBar
        search={search}
        searchBy={searchBy}
        setSearchBy={setSearchBy}
        isSearching={isSearching}
      />
      <div className='container'>
        <SearchResults
          className="search-results"
          results={searchResults}
          hasSearched={hasSearched}
          addToPlaylist={addToPlaylist} />
        <Playlist className="track-list"
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
