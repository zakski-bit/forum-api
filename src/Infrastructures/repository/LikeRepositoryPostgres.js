import LikeRepository from '../../Domains/likes/LikeRepository.js';

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async likeComment(userId, commentId) {
    const id = `like-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO user_comment_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, commentId],
    };

    await this._pool.query(query);
  }

  async unlikeComment(userId, commentId) {
    const query = {
      text: 'DELETE FROM user_comment_likes WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    await this._pool.query(query);
  }

  async isCommentLiked(userId, commentId) {
    const query = {
      text: 'SELECT id FROM user_comment_likes WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  async getLikeCountsByThreadId(threadId) {
    const query = {
      text: `SELECT user_comment_likes.comment_id, COUNT(user_comment_likes.id)::int AS like_count
             FROM user_comment_likes
             INNER JOIN comments ON comments.id = user_comment_likes.comment_id
             WHERE comments.thread_id = $1
             GROUP BY user_comment_likes.comment_id`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

export default LikeRepositoryPostgres;
