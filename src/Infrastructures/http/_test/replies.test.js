import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';
import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 401 when request does not contain access token', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .post('/threads/thread-123/comments/comment-123/replies')
        .send({ content: 'sebuah balasan' });

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
        .post('/threads/thread-xxx/comments/comment-123/replies')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah balasan' });

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
        .post('/threads/thread-123/comments/comment-xxx/replies')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah balasan' });

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should response 400 when request payload does not contain needed property', async () => {
      // Arrange
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .post('/threads/thread-123/comments/comment-123/replies')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .post('/threads/thread-123/comments/comment-123/replies')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 12345 });

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should response 201 and persisted reply', async () => {
      // Arrange
      const requestPayload = {
        content: 'sebuah balasan',
      };
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .post('/threads/thread-123/comments/comment-123/replies')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedReply).toBeDefined();
      expect(response.body.data.addedReply.content).toEqual(requestPayload.content);
      expect(response.body.data.addedReply.owner).toEqual('user-123');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 401 when request does not contain access token', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123/replies/reply-123');

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
        .delete('/threads/thread-xxx/comments/comment-123/replies/reply-123')
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
        .delete('/threads/thread-123/comments/comment-xxx/replies/reply-123')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should response 404 when reply not found', async () => {
      // Arrange
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123/replies/reply-xxx')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should response 403 when user is not the reply owner', async () => {
      // Arrange
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });
      const otherUserAccessToken = await tokenManager.createAccessToken({ id: 'user-456', username: 'johndoe' });

      // Action
      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123/replies/reply-123')
        .set('Authorization', `Bearer ${otherUserAccessToken}`);

      // Assert
      expect(response.status).toEqual(403);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should response 200 and soft delete reply correctly', async () => {
      // Arrange
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123/replies/reply-123')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');

      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies[0].is_delete).toEqual(true);
    });
  });
});
