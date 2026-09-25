import { describe, it, expect } from 'vitest';
import DetailComment from '../DetailComment.js';

describe('DetailComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
    };

    // Action & Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      username: 'dicoding',
      date: 12345,
      content: 'sebuah comment',
    };

    // Action & Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when likeCount is not a number', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah comment',
      likeCount: '2',
    };

    // Action & Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailComment object correctly when not deleted', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah comment',
      isDelete: false,
      likeCount: 5,
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.content).toEqual(payload.content);
    expect(detailComment.likeCount).toEqual(5);
    expect(detailComment.replies).toEqual([]);
  });

  it('should create DetailComment object with deleted content when isDelete is true', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah comment',
      isDelete: true,
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment.content).toEqual('**komentar telah dihapus**');
    expect(detailComment.likeCount).toEqual(0);
  });

  it('should create DetailComment object correctly with Date instance', () => {
    // Arrange
    const now = new Date();
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: now,
      content: 'sebuah comment',
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment.date).toEqual(now.toISOString());
    expect(detailComment.likeCount).toEqual(0);
  });
});
