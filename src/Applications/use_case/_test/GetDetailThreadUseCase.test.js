import {
  describe, it, expect, vi,
} from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import LikeRepository from '../../../Domains/likes/LikeRepository.js';
import DetailThread from '../../../Domains/threads/entities/DetailThread.js';
import DetailComment from '../../../Domains/comments/entities/DetailComment.js';
import DetailReply from '../../../Domains/replies/entities/DetailReply.js';
import GetDetailThreadUseCase from '../GetDetailThreadUseCase.js';

describe('GetDetailThreadUseCase', () => {
  it('should orchestrating the get detail thread action correctly with likeRepository', async () => {
    // Arrange
    const threadId = 'thread-123';

    const threadFromRepo = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const commentsFromRepo = [
      {
        id: 'comment-2',
        username: 'johndoe',
        date: '2021-08-08T07:25:00.000Z',
        content: 'komentar kedua',
        'is_delete': true,
      },
      {
        id: 'comment-1',
        username: 'dicoding',
        date: '2021-08-08T07:22:00.000Z',
        content: 'komentar pertama',
        'is_delete': false,
      },
    ];

    const repliesFromRepo = [
      {
        id: 'reply-2',
        'comment_id': 'comment-1',
        content: 'balasan kedua',
        date: '2021-08-08T07:24:00.000Z',
        username: 'dicoding',
        'is_delete': false,
      },
      {
        id: 'reply-1',
        'comment_id': 'comment-1',
        content: 'balasan pertama',
        date: '2021-08-08T07:23:00.000Z',
        username: 'johndoe',
        'is_delete': true,
      },
    ];

    const likeCountsFromRepo = [
      {
        'comment_id': 'comment-1',
        'like_count': 2,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed functions */
    mockThreadRepository.getThreadById = vi.fn()
      .mockImplementation(() => Promise.resolve(threadFromRepo));
    mockCommentRepository.getCommentsByThreadId = vi.fn()
      .mockImplementation(() => Promise.resolve(commentsFromRepo));
    mockReplyRepository.getRepliesByThreadId = vi.fn()
      .mockImplementation(() => Promise.resolve(repliesFromRepo));
    mockLikeRepository.getLikeCountsByThreadId = vi.fn()
      .mockImplementation(() => Promise.resolve(likeCountsFromRepo));

    /** creating use case instance */
    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const detailThread = await getDetailThreadUseCase.execute(threadId);

    // Assert
    expect(detailThread).toStrictEqual(new DetailThread({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        new DetailComment({
          id: 'comment-1',
          username: 'dicoding',
          date: '2021-08-08T07:22:00.000Z',
          content: 'komentar pertama',
          isDelete: false,
          likeCount: 2,
          replies: [
            new DetailReply({
              id: 'reply-1',
              content: 'balasan pertama',
              date: '2021-08-08T07:23:00.000Z',
              username: 'johndoe',
              isDelete: true,
            }),
            new DetailReply({
              id: 'reply-2',
              content: 'balasan kedua',
              date: '2021-08-08T07:24:00.000Z',
              username: 'dicoding',
              isDelete: false,
            }),
          ],
        }),
        new DetailComment({
          id: 'comment-2',
          username: 'johndoe',
          date: '2021-08-08T07:25:00.000Z',
          content: 'komentar kedua',
          isDelete: true,
          likeCount: 0,
          replies: [],
        }),
      ],
    }));

    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toHaveBeenCalledWith(threadId);
    expect(mockLikeRepository.getLikeCountsByThreadId).toHaveBeenCalledWith(threadId);
  });

  it('should orchestrating correctly when likeRepository is not provided', async () => {
    // Arrange
    const threadId = 'thread-123';

    const threadFromRepo = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed functions */
    mockThreadRepository.getThreadById = vi.fn()
      .mockImplementation(() => Promise.resolve(threadFromRepo));
    mockCommentRepository.getCommentsByThreadId = vi.fn()
      .mockImplementation(() => Promise.resolve([]));
    mockReplyRepository.getRepliesByThreadId = vi.fn()
      .mockImplementation(() => Promise.resolve([]));

    /** creating use case instance */
    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const detailThread = await getDetailThreadUseCase.execute(threadId);

    // Assert
    expect(detailThread.comments).toHaveLength(0);
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(threadId);
  });
});
