import {
  describe, it, expect, beforeEach, afterEach, afterAll,
} from 'vitest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import LikesTableTestHelper from '../../../../tests/LikesTableTestHelper.js';
import LikeRepositoryPostgres from '../LikeRepositoryPostgres.js';

describe('LikeRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('likeComment function', () => {
    it('should persist like and add like to database', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.likeComment('user-123', 'comment-123');

      // Assert
      const likes = await LikesTableTestHelper.findLike({
        userId: 'user-123',
        commentId: 'comment-123',
      });
      expect(likes).toHaveLength(1);
      expect(likes[0].id).toBe('like-123');
    });
  });

  describe('unlikeComment function', () => {
    it('should delete like from database', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({ id: 'like-123', userId: 'user-123', commentId: 'comment-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      await likeRepositoryPostgres.unlikeComment('user-123', 'comment-123');

      // Assert
      const likes = await LikesTableTestHelper.findLike({
        userId: 'user-123',
        commentId: 'comment-123',
      });
      expect(likes).toHaveLength(0);
    });
  });

  describe('isCommentLiked function', () => {
    it('should return false if comment is not liked by user', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const isLiked = await likeRepositoryPostgres.isCommentLiked('user-123', 'comment-123');

      // Assert
      expect(isLiked).toBe(false);
    });

    it('should return true if comment is liked by user', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({ id: 'like-123', userId: 'user-123', commentId: 'comment-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const isLiked = await likeRepositoryPostgres.isCommentLiked('user-123', 'comment-123');

      // Assert
      expect(isLiked).toBe(true);
    });
  });

  describe('getLikeCountsByThreadId function', () => {
    it('should return like counts grouped by comment_id for a thread', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-456', threadId: 'thread-123', owner: 'user-123' });
      await LikesTableTestHelper.addLike({ id: 'like-1', userId: 'user-123', commentId: 'comment-123' });
      await LikesTableTestHelper.addLike({ id: 'like-2', userId: 'user-456', commentId: 'comment-123' });
      await LikesTableTestHelper.addLike({ id: 'like-3', userId: 'user-123', commentId: 'comment-456' });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const likeCounts = await likeRepositoryPostgres.getLikeCountsByThreadId('thread-123');

      // Assert
      expect(likeCounts).toHaveLength(2);
      const comment123Count = likeCounts.find((lc) => lc.comment_id === 'comment-123');
      const comment456Count = likeCounts.find((lc) => lc.comment_id === 'comment-456');
      expect(comment123Count.like_count).toBe(2);
      expect(comment456Count.like_count).toBe(1);
    });
  });
});
