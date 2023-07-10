const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this); // mem-bind nilai this untuk seluruh method sekaligus
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const albumId = await this._service.addAlbum(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });

    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);

    const songs = await this._service.getSongsByAlbumId(album.id);

    return {
      status: 'success',
      data: {
        album: {
          ...album,
          songs,
        },
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;

    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumLikeHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const message = await this._service.likeTheAlbum(id, credentialId);
    const response = h.response({
      status: 'success',
      message,
    });
    response.code(201);
    return response;
  }

  async deleteAlbumLikeHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const message = await this._service.unlikeTheAlbum(id, credentialId);

    return {
      status: 'success',
      message,
    };
  }

  async getAlbumLikesByIdHandler(request, h) {
    const { id } = request.params;
    const { likes, cached } = await this._service.getAlbumLikesById(id);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    return cached ? response.header('X-Data-Source', 'cache') : response;
  }
}

module.exports = AlbumsHandler;
