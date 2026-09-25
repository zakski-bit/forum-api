import {
  describe, it, expect, vi,
} from 'vitest';
import ToggleLikeCommentUseCase from '../ToggleLikeCommentUseCase.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import LikeRepository from '../../../Domains/likes/LikeRepository.js';

describe('ToggleLikeCommentUseCase', () => {
  it('should throw error if use case payload not contain needed property', async () => {
    // Arrange
    const useCase = new ToggleLikeCommentUseCase({});

    // Action & Assert
    await expect(useCase.execute({}))
      .rejects
      .toThrow('TOGGLE_LIKE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if use case payload not meet data type specification', async () => {
    // Arrange
    const useCase = new ToggleLikeCommentUseCase({});

    // Action & Assert
    await expect(useCase.execute({
      threadId: 123,
      commentId: 'comment-123',
      userId: 'user-123',
    })).rejects.toThrow('TOGGLE_LIKE_COMMENT_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating like comment action correctly when comment is not liked yet', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyAvailableThread = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableComment = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.isCommentLiked = vi.fn()
      .mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.likeComment = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.unlikeComment = vi.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await toggleLikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyAvailableComment)
      .toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockLikeRepository.isCommentLiked)
      .toHaveBeenCalledWith(useCasePayload.userId, useCasePayload.commentId);
    expect(mockLikeRepository.likeComment)
      .toHaveBeenCalledWith(useCasePayload.userId, useCasePayload.commentId);
    expect(mockLikeRepository.unlikeComment)
      .not.toHaveBeenCalled();
  });

  it('should orchestrating unlike comment action correctly when comment is already liked', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyAvailableThread = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableComment = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.isCommentLiked = vi.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.likeComment = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.unlikeComment = vi.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await toggleLikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyAvailableComment)
      .toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockLikeRepository.isCommentLiked)
      .toHaveBeenCalledWith(useCasePayload.userId, useCasePayload.commentId);
    expect(mockLikeRepository.unlikeComment)
      .toHaveBeenCalledWith(useCasePayload.userId, useCasePayload.commentId);
    expect(mockLikeRepository.likeComment)
      .not.toHaveBeenCalled();
  });
});
