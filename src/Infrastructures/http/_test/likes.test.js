import {
  describe, it, expect, afterAll, afterEach,
} from 'vitest';
import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import LikesTableTestHelper from '../../../../tests/LikesTableTestHelper.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';
import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 401 when request does not contain access token', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .put('/threads/thread-123/comments/comment-123/likes');

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .put('/threads/thread-xxx/comments/comment-123/likes')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .put('/threads/thread-123/comments/comment-xxx/likes')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should response 200 and like the comment when not liked yet', async () => {
      // Arrange
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .put('/threads/thread-123/comments/comment-123/likes')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');

      const likes = await LikesTableTestHelper.findLike({
        userId: 'user-123',
        commentId: 'comment-123',
      });
      expect(likes).toHaveLength(1);
    });

    it('should response 200 and unlike the comment when already liked', async () => {
      // Arrange
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await LikesTableTestHelper.addLike({ id: 'like-123', userId: 'user-123', commentId: 'comment-123' });
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .put('/threads/thread-123/comments/comment-123/likes')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');

      const likes = await LikesTableTestHelper.findLike({
        userId: 'user-123',
        commentId: 'comment-123',
      });
      expect(likes).toHaveLength(0);
    });
  });
});
