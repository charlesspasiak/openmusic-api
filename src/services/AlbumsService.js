const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const { mapAlbumDBToModel } = require('../utils');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan album');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return result.rows.map(mapAlbumDBToModel)[0];
  }

  async getSongsByAlbumId(albumId) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async updateAlbumCover(id, coverUrl) {
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2',
      values: [coverUrl, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(
        'Gagal memperbarui sampul album. Id tidak ditemukan',
      );
    }
  }

  async isAlbumExist(albumId) {
    const result = await this._pool.query({
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [albumId],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }

  async checkAlbumLikes(albumId, userId) {
    await this.isAlbumExist(albumId);

    const query = {
      text: 'SELECT album_id, user_id FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      await this.likeAlbum(albumId, userId);

      return 'Menyukai album';
    }

    await this.unlikeAlbum(albumId, userId);

    return 'Batal menyukai album';
  }

  async likeAlbum(albumId, userId) {
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2)',
      values: [albumId, userId],
    };

    await this._pool.query(query);
  }

  async unlikeAlbum(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    await this._pool.query(query);
  }
}

module.exports = AlbumsService;
