import React from 'react';
import './App.css';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import SeachResults from './components/SearchResults';
import Playlist from './components/Playlist';
import Spotify from "./util/Spotify";

import { useState, useCallback } from 'react';

function App() {

  const [searchBy, setSearchBy] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [message, setMessage] = useState("");

  // Spotify Calls
  const search = useCallback(() => {
    Spotify.search(searchBy)
      .then(setSearchResults);
  }, [searchBy]);

  const savePlaylist = useCallback(async () => {
    try {
      const uris = playlistTracks.map((song) => song.uri);
      const response = await Spotify.savePlaylist(playlistName, uris);
      if (response === 201) {
        clearPlaylist();
        addMessage();
      }
    } catch (e) {
      console.log('savePlaylist Error catched: ', e);
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
      alert('This song is in the playlist.')
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
      />
      <div className='container'>
        <SeachResults
          className="search-results"
          results={searchResults}
          addToPlaylist={addToPlaylist} />
        <Playlist className="track-list"
          playlistTracks={playlistTracks}
          setPlaylistName={setPlaylistName}
          playlistName={playlistName}
          removeFromPlaylist={removeFromPlaylist}
          savePlaylist={savePlaylist}
          addMessage={addMessage}
          message={message}
        />
      </div>
    </div>
  );
}

export default App;
