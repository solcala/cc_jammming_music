import { z } from 'zod';
import {
  addTracksRequestSchema,
  createPlaylistRequestSchema,
  searchQuerySchema,
  spotifyPlaylistResponseSchema,
  spotifySearchResponseSchema,
  spotifyTokenResponseSchema,
  spotifyUserResponseSchema,
  tokenExchangeFormSchema,
  trackSchema,
  type AddTracksRequest,
  type CreatePlaylistRequest,
  type SpotifyPlaylistResponse,
  type SpotifySearchResponse,
  type SpotifyTokenResponse,
  type SpotifyUserResponse,
  type TokenExchangeForm,
  type Track,
} from './spotify';

function formatZodError(label: string, error: z.ZodError): string {
  const details = error.issues
    .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('; ');
  return `${label} failed contract validation: ${details}`;
}

function parseWithLabel<T>(
  schema: z.ZodType<T>,
  data: unknown,
  label: string,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(formatZodError(label, result.error));
  }
  return result.data;
}

/** Assert unknown JSON matches a schema; throws with a labeled message. */
export function assertContract<T>(
  schema: z.ZodType<T>,
  data: unknown,
  label: string,
): T {
  return parseWithLabel(schema, data, label);
}

export function parseSpotifySearchResponse(
  data: unknown,
): SpotifySearchResponse {
  return parseWithLabel(
    spotifySearchResponseSchema,
    data,
    'SpotifySearchResponse',
  );
}

export function parseSpotifyUserResponse(data: unknown): SpotifyUserResponse {
  return parseWithLabel(spotifyUserResponseSchema, data, 'SpotifyUserResponse');
}

export function parseSpotifyPlaylistResponse(
  data: unknown,
): SpotifyPlaylistResponse {
  return parseWithLabel(
    spotifyPlaylistResponseSchema,
    data,
    'SpotifyPlaylistResponse',
  );
}

export function parseSpotifyTokenResponse(data: unknown): SpotifyTokenResponse {
  return parseWithLabel(
    spotifyTokenResponseSchema,
    data,
    'SpotifyTokenResponse',
  );
}

export function parseTrack(data: unknown): Track {
  return parseWithLabel(trackSchema, data, 'Track');
}

export function parseTracks(data: unknown): Track[] {
  return parseWithLabel(z.array(trackSchema), data, 'Track[]');
}

export function parseCreatePlaylistRequest(
  data: unknown,
): CreatePlaylistRequest {
  return parseWithLabel(
    createPlaylistRequestSchema,
    data,
    'CreatePlaylistRequest',
  );
}

export function parseAddTracksRequest(data: unknown): AddTracksRequest {
  return parseWithLabel(addTracksRequestSchema, data, 'AddTracksRequest');
}

export function parseTokenExchangeForm(
  postData: string | null,
): TokenExchangeForm {
  const params = Object.fromEntries(new URLSearchParams(postData ?? ''));
  return parseWithLabel(tokenExchangeFormSchema, params, 'TokenExchangeForm');
}

export function parseSearchQuery(query: string | null): string {
  return parseWithLabel(searchQuerySchema, query, 'SearchQuery');
}
