import { describe, it, expect, vi } from 'vitest';
import AuthenticationError from '../../../Commons/exceptions/AuthenticationError.js';
import authMiddleware from '../authMiddleware.js';

describe('authMiddleware', () => {
  it('should call next with AuthenticationError when authorization header is missing', async () => {
    // Arrange
    const req = { headers: {} };
    const res = {};
    const next = vi.fn();
    const container = {};

    const middleware = authMiddleware(container);

    // Action
    await middleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(new AuthenticationError('Missing authentication'));
  });

  it('should call next with AuthenticationError when authorization header has invalid format', async () => {
    // Arrange
    const req = { headers: { authorization: 'Basic xyz' } };
    const res = {};
    const next = vi.fn();
    const container = {};

    const middleware = authMiddleware(container);

    // Action
    await middleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(new AuthenticationError('Missing authentication'));
  });

  it('should call next with error when token verification fails', async () => {
    // Arrange
    const req = { headers: { authorization: 'Bearer invalid_token' } };
    const res = {};
    const next = vi.fn();

    const mockTokenManager = {
      verifyAccessToken: vi.fn().mockRejectedValue(new AuthenticationError('Missing authentication')),
      decodePayload: vi.fn(),
    };

    const container = {
      getInstance: vi.fn().mockReturnValue(mockTokenManager),
    };

    const middleware = authMiddleware(container);

    // Action
    await middleware(req, res, next);

    // Assert
    expect(mockTokenManager.verifyAccessToken).toHaveBeenCalledWith('invalid_token');
    expect(next).toHaveBeenCalledWith(new AuthenticationError('Missing authentication'));
  });

  it('should set req.auth.credentials and call next with no args when token is valid', async () => {
    // Arrange
    const req = { headers: { authorization: 'Bearer valid_token' } };
    const res = {};
    const next = vi.fn();

    const mockTokenManager = {
      verifyAccessToken: vi.fn().mockResolvedValue(),
      decodePayload: vi.fn().mockResolvedValue({ id: 'user-123', username: 'dicoding' }),
    };

    const container = {
      getInstance: vi.fn().mockReturnValue(mockTokenManager),
    };

    const middleware = authMiddleware(container);

    // Action
    await middleware(req, res, next);

    // Assert
    expect(mockTokenManager.verifyAccessToken).toHaveBeenCalledWith('valid_token');
    expect(mockTokenManager.decodePayload).toHaveBeenCalledWith('valid_token');
    expect(req.auth).toStrictEqual({
      credentials: {
        id: 'user-123',
        username: 'dicoding',
      },
    });
    expect(next).toHaveBeenCalledWith();
  });
});
