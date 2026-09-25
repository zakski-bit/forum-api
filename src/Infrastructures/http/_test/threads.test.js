import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';
import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 401 when request does not contain access token', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      };
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .post('/threads')
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload does not contain needed property', async () => {
      // Arrange
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'sebuah thread',
        });

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
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 123,
          body: true,
        });

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      };
      const app = await createServer(container);
      const tokenManager = container.getInstance(AuthenticationTokenManager.name);
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const accessToken = await tokenManager.createAccessToken({ id: 'user-123', username: 'dicoding' });

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedThread).toBeDefined();
      expect(response.body.data.addedThread.title).toEqual(requestPayload.title);
      expect(response.body.data.addedThread.owner).toEqual('user-123');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 404 when thread not found', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app).get('/threads/thread-xxx');

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should response 200 and return thread detail correctly', async () => {
      // Arrange
      const app = await createServer(container);
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        owner: 'user-123',
        date: '2021-08-08T07:19:09.775Z',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'sebuah comment',
        owner: 'user-123',
        date: '2021-08-08T07:22:33.555Z',
      });

      // Action
      const response = await request(app).get('/threads/thread-123');

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.thread).toBeDefined();
      expect(response.body.data.thread.id).toEqual('thread-123');
      expect(response.body.data.thread.title).toEqual('sebuah thread');
      expect(response.body.data.thread.body).toEqual('sebuah body thread');
      expect(response.body.data.thread.username).toEqual('dicoding');
      expect(response.body.data.thread.comments).toHaveLength(1);
      expect(response.body.data.thread.comments[0].id).toEqual('comment-123');
      expect(response.body.data.thread.comments[0].username).toEqual('dicoding');
      expect(response.body.data.thread.comments[0].content).toEqual('sebuah comment');
    });
  });
});
