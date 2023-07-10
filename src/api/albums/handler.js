const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(albumsService, storageService, validator) {
    this._albumsService = albumsService;
    this._storageService = storageService;
    this._validator = validator;

    autoBind(this); // mem-bind nilai this untuk seluruh method sekaligus
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const albumId = await this._albumsService.addAlbum(request.payload);

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
    const album = await this._albumsService.getAlbumById(id);

    const songs = await this._albumsService.getSongsByAlbumId(album.id);

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
    await this._albumsService.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;

    await this._albumsService.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumCoverHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;
    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/images/${filename}`;

    await this._albumsService.updateAlbumCover(id, coverUrl);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async postAlbumLikeHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const message = await this._albumsService.likeTheAlbum(id, credentialId);
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

    const message = await this._albumsService.unlikeTheAlbum(id, credentialId);

    return {
      status: 'success',
      message,
    };
  }

  async getAlbumLikesByIdHandler(request, h) {
    const { id } = request.params;
    const { likes, cached } = await this._albumsService.getAlbumLikesById(id);

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
