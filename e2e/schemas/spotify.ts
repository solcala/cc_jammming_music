import { z } from 'zod';

/** Spotify Web API artist (subset used by Jammming). */
export const spotifyArtistSchema = z.object({
  name: z.string(),
});

/** Spotify Web API album (subset used by Jammming). */
export const spotifyAlbumSchema = z.object({
  name: z.string(),
});

/** Spotify Web API track item from search results. */
export const spotifyApiTrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  uri: z.string(),
  artists: z.array(spotifyArtistSchema).min(1),
  album: spotifyAlbumSchema,
});

/** GET /v1/search?type=track response (subset). */
export const spotifySearchResponseSchema = z.object({
  tracks: z
    .object({
      items: z.array(spotifyApiTrackSchema),
    })
    .optional(),
});

/** GET /v1/me response (subset). */
export const spotifyUserResponseSchema = z.object({
  id: z.string(),
  display_name: z.string().optional(),
});

/** POST create playlist response (subset). */
export const spotifyPlaylistResponseSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  uri: z.string().optional(),
});

/** POST /api/token response (Authorization Code + PKCE). */
export const spotifyTokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  scope: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
});

/** App-level Track used in UI reconciliation. */
export const trackSchema = z.object({
  id: z.string(),
  name: z.string(),
  artist: z.string(),
  album: z.string(),
  uri: z.string(),
});

/** POST create playlist request body. */
export const createPlaylistRequestSchema = z.object({
  name: z.string().min(1),
});

/** POST add tracks request body. */
export const addTracksRequestSchema = z.object({
  uris: z.array(z.string()).min(1),
});

export type SpotifySearchResponse = z.infer<typeof spotifySearchResponseSchema>;
export type SpotifyUserResponse = z.infer<typeof spotifyUserResponseSchema>;
export type SpotifyPlaylistResponse = z.infer<typeof spotifyPlaylistResponseSchema>;
export type SpotifyTokenResponse = z.infer<typeof spotifyTokenResponseSchema>;
export type Track = z.infer<typeof trackSchema>;
export type CreatePlaylistRequest = z.infer<typeof createPlaylistRequestSchema>;
export type AddTracksRequest = z.infer<typeof addTracksRequestSchema>;
