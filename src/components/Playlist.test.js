import React, { useState } from "react";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Playlist from "./Playlist";

const defaultProps = {
  playlistTracks: [],
  removeFromPlaylist: () => {},
  savePlaylist: () => {},
  playlistName: "",
  setPlaylistName: () => {},
  addMessage: () => {},
  message: "",
};

it("input to add title with placeholder", () => {
  render(<Playlist {...defaultProps} />);
  const input = screen.getByRole("textbox");
  expect(input.getAttribute("placeholder")).toBe("Add a playlist title");
});

it("save to playlist button is displayed", () => {
  render(<Playlist {...defaultProps} />);
  const button = screen.getByRole("button");
  expect(button).toHaveTextContent("Save to Spotify");
});

it("displays tracks when provided", () => {
  const tracks = [
    {
      id: "1",
      name: "My Song",
      artist: "Artist X",
      album: "Album X",
      uri: "spotify:track:1",
    },
  ];
  render(<Playlist {...defaultProps} playlistTracks={tracks} />);
  expect(screen.getByText("My Song")).toBeInTheDocument();
});

it("displays the playlist message", () => {
  render(<Playlist {...defaultProps} message="Playlist created" />);
  expect(screen.getByTestId("playlist-message")).toHaveTextContent(
    "Playlist created",
  );
});

it("shows inline error when saving without a playlist title", async () => {
  const user = userEvent.setup();
  const tracks = [
    {
      id: "1",
      name: "My Song",
      artist: "Artist X",
      album: "Album X",
      uri: "spotify:track:1",
    },
  ];
  render(<Playlist {...defaultProps} playlistTracks={tracks} />);
  await user.click(screen.getByTestId("save-playlist-button"));
  expect(screen.getByTestId("playlist-validation-error")).toHaveTextContent(
    "Add a playlist title",
  );
});

it("shows inline error when saving without tracks", async () => {
  const user = userEvent.setup();
  render(<Playlist {...defaultProps} playlistName="Empty Playlist" />);
  await user.click(screen.getByTestId("save-playlist-button"));
  expect(screen.getByTestId("playlist-validation-error")).toHaveTextContent(
    "Add at least a track to the playlist",
  );
});

it("shows Saving... while a save is in progress", () => {
  render(<Playlist {...defaultProps} isSaving={true} />);
  expect(screen.getByTestId("save-playlist-button")).toHaveTextContent(
    "Saving...",
  );
  expect(screen.getByTestId("save-playlist-button")).toBeDisabled();
});

it("clears validation error when playlist title changes", async () => {
  const user = userEvent.setup();
  const tracks = [
    {
      id: "1",
      name: "My Song",
      artist: "Artist X",
      album: "Album X",
      uri: "spotify:track:1",
    },
  ];

  function PlaylistWrapper() {
    const [playlistName, setPlaylistName] = useState("");
    return (
      <Playlist
        {...defaultProps}
        playlistTracks={tracks}
        playlistName={playlistName}
        setPlaylistName={setPlaylistName}
      />
    );
  }

  render(<PlaylistWrapper />);

  await user.click(screen.getByTestId("save-playlist-button"));
  expect(screen.getByTestId("playlist-validation-error")).toBeInTheDocument();

  await user.type(screen.getByTestId("playlist-title-input"), "My Playlist");
  expect(
    screen.queryByTestId("playlist-validation-error"),
  ).not.toBeInTheDocument();
});

it("exposes playlist message as a polite live region", () => {
  render(<Playlist {...defaultProps} message="Playlist created" />);
  const message = screen.getByTestId("playlist-message");
  expect(message).toHaveAttribute("role", "status");
  expect(message).toHaveAttribute("aria-live", "polite");
});
