// const autoBind = require('auto-bind');

// class AlbumsHandler {
//   constructor(service, validator) {
//     this._service = service;
//     this._validator = validator;

//     autoBind(this); // mem-bind nilai this untuk seluruh method sekaligus
//   }

//   async postAlbumHandler(request, h) {
//     this._validator.validateAlbumPayload(request.payload);

//     const albumId = await this._service.addAlbum(request.payload);

//     const response = h.response({
//       status: 'success',
//       data: {
//         albumId,
//       },
//     });

//     response.code(201);
//     return response;
//   }

//   async getAlbumByIdHandler(request) {
//     const { id } = request.params;
//     const album = await this._service.getAlbumById(id);

//     const songs = await this._service.getSongsByAlbumId(album.id);

//     return {
//       status: 'success',
//       data: {
//         album: {
//           ...album, songs,
//         },
//       },
//     };
//   }

//   async putAlbumByIdHandler(request) {
//     this._validator.validateAlbumPayload(request.payload);
//     const { id } = request.params;
//     await this._service.editAlbumById(id, request.payload);

//     return {
//       status: 'success',
//       message: 'Album berhasil diperbarui',
//     };
//   }

//   async deleteAlbumByIdHandler(request) {
//     const { id } = request.params;

//     await this._service.deleteAlbumById(id);

//     return {
//       status: 'success',
//       message: 'Album berhasil dihapus',
//     };
//   }
// }

// module.exports = AlbumsHandler;

const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');

class AlbumsHandler {
  constructor(
    albumsService,
    albumsValidator,
    storageService,
    uploadsValidator,
  ) {
    this._albumsService = albumsService;
    this._albumsValidator = albumsValidator;
    this._storageService = storageService;
    this._uploadsValidator = uploadsValidator;

    autoBind(this);
  }

  async postAlbumHandler(req, h) {
    try {
      this._albumsValidator.validateAlbumPayload(req.payload);
      const { name, year } = req.payload;

      const albumId = await this._albumsService.addAlbum({
        name,
        year,
      });

      const response = h.response({
        status: 'success',
        message: 'Album berhasil ditambahkan',
        data: {
          albumId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getAlbumsHandler(h) {
    try {
      const albums = await this._albumsService.getAlbums();
      return {
        status: 'success',
        data: {
          albums,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getAlbumByIdHandler(req, h) {
    try {
      const { id } = req.params;
      const album = await this._albumsService.getAlbumById(id);
      return {
        status: 'success',
        data: {
          album,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async putAlbumByIdHandler(req, h) {
    try {
      this._albumsValidator.validateAlbumPayload(req.payload);
      const { id } = req.params;

      await this._albumsService.editAlbumById(id, req.payload);

      return {
        status: 'success',
        message: 'Album berhasil diperbarui',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteAlbumByIdHandler(req, h) {
    try {
      const { id } = req.params;
      await this._albumsService.deleteAlbumById(id);
      return {
        status: 'success',
        message: 'Album berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async postUploadImageHandler(req, h) {
    try {
      const { id } = req.params;
      const { cover } = req.payload;

      await this._albumsService.isAlbumExist(id);
      this._uploadsValidator.validateImageHeaders(cover.hapi.headers);

      const filename = await this._storageService.writeFile(cover, cover.hapi);
      const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/albums/covers/${filename}`;
      await this._albumsService.editAlbumCoverById(id, fileLocation);

      const response = h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async postLikesAlbumHandler(req, h) {
    try {
      const { id } = req.params;
      const { id: credentialId } = req.auth.credentials;

      const message = await this._albumsService.likeTheAlbum(id, credentialId);
      const response = h.response({
        status: 'success',
        message,
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getAlbumLikesByIdHandler(req, h) {
    try {
      const { id } = req.params;
      const { likes, source } = await this._albumsService.getAlbumLikesById(id);
      const response = h.response({
        status: 'success',
        data: {
          likes,
        },
      });
      response.header('X-Data-Source', source);
      response.code(200);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = AlbumsHandler;
