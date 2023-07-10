const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { mapSongDBToModel } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    const query = {
      text: 'SELECT id, title, performer FROM songs',
      values: [],
    };

    if (title && performer) {
      query.text += ' WHERE LOWER(title) LIKE $1 AND LOWER(performer) LIKE $2';
      query.values = [`%${title}%`, `%${performer}%`];
    } else if (title) {
      query.text += ' WHERE LOWER(title) LIKE $1';
      query.values = [`%${title}%`];
    } else if (performer) {
      query.text += ' WHERE LOWER(performer) LIKE $1';
      query.values = [`%${performer}%`];
    }

    const result = await this._pool.query(query);

    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows.map(mapSongDBToModel)[0];
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7',
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const result = await this._pool.query('DELETE FROM songs WHERE id = $1', [
      id,
    ]);

    if (result.rowCount === 0) {
      throw new NotFoundError('Gagal menghapus lagu. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;
