/* eslint-disable camelcase */
const mapSongDBToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});

const mapAlbumDBToModel = ({ cover_url, ...albums }) => ({
  ...albums,
  coverUrl: cover_url,
});

module.exports = { mapSongDBToModel, mapAlbumDBToModel };
