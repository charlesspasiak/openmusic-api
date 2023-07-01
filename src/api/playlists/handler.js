const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(playlistsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({ name, owner: credentialId });

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {

  }

  async deletePlaylistByIdHandler(request, h) {

  }

  async postSongHandler(request, h) {

  }

  async getSongsHandler(request, h) {

  }

  async deleteSongByIdHandler(request, h) {

  }

  async getActivitiesHandler(request, h) {

  }
}

module.exports = PlaylistsHandler;
