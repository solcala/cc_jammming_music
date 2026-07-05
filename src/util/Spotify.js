const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID; // Insert client ID here.
const redirectUri = process.env.REACT_APP_REDIRECT_URI; // Have to add this to your accepted Spotify redirect URIs on the Spotify API.
let accessToken;

const Spotify = {
  loadSpotifyLoginPage() {
    const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
    // This loads the accessUrl in the windows / so the user can add its credentials.
    window.location = accessUrl;
    // user needs to login and it's redirect to the app to redirectUri
  },

  checkAccessToken() {
    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      window.setTimeout(() => (accessToken = ""), expiresIn * 1000);
      window.history.pushState(
        "Access Token",
        null,
        process.env.PUBLIC_URL || "/",
      );
      return accessToken;
    }
  },

  getAccessToken() {
    try {
      if (accessToken) {
        return accessToken;
      }
      const accessTokenMatch =
        window.location.href.match(/access_token=([^&]*)/);
      const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

      if (!(accessTokenMatch && expiresInMatch)) {
        this.loadSpotifyLoginPage();
        return;
      }

      accessToken = this.checkAccessToken();
      return accessToken;
    } catch (error) {
      console.log(error);
    }
  },

  async search(term) {
    try {
      if (!term) {
        return;
      }
      const accessToken = await this.getAccessToken();
      const response = await fetch(
        `https://api.spotify.com/v1/search?type=track&q=${term}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.status === 401) {
        return [];
      }

      if (response.ok) {
        const jsonResponse = await response.json();

        if (!jsonResponse.tracks) {
          return [];
        }

        return jsonResponse.tracks.items.map((track) => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri,
        }));
      }
      throw new Error(`Request failed - search by  ${term}`);
    } catch (error) {
      console.log(`Request failed - search by  ${term}`);
      console.log(error);
    }
  },

  async savePlaylist(name, trackUris) {
    try {
      if (!name || !trackUris.length) {
        return;
      }
      const accessToken = await this.getAccessToken();
      const headers = { Authorization: `Bearer ${accessToken}` };
      let userId;

      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: headers,
        cache: "no-cache",
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        userId = jsonResponse.id;
        const response2 = await fetch(
          `https://api.spotify.com/v1/users/${userId}/playlists`,
          {
            headers: headers,
            method: "POST",
            body: JSON.stringify({ name: name }),
          },
        );

        if (response2.ok) {
          const jsonResponse2 = await response2.json();
          const playlistId = jsonResponse2.id;
          const response3 = await fetch(
            `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
            {
              headers: headers,
              method: "POST",
              body: JSON.stringify({ uris: trackUris }),
            },
          );
          if (response3.ok) {
            return response3.status;
          }
        }
      }
      throw new Error("Request failed!");
    } catch (error) {
      console.log(error);
    }
  },
};

export default Spotify;
