import AuthenticationTokenManager from '../../Applications/security/AuthenticationTokenManager.js';
import AuthenticationError from '../../Commons/exceptions/AuthenticationError.js';

const authMiddleware = (container) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AuthenticationError('Missing authentication');
    }

    const match = authHeader.match(/^Bearer (.+)$/);
    if (!match) {
      throw new AuthenticationError('Missing authentication');
    }

    const token = match[1];
    const tokenManager = container.getInstance(AuthenticationTokenManager.name);
    await tokenManager.verifyAccessToken(token);
    const { id, username } = await tokenManager.decodePayload(token);

    req.auth = {
      credentials: {
        id,
        username,
      },
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
