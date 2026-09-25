import express from 'express';
import authMiddleware from '../../../../Infrastructures/http/authMiddleware.js';

const createLikesRouter = (handler, container) => {
  const router = express.Router();

  router.put('/:threadId/comments/:commentId/likes', authMiddleware(container), handler.putLikeHandler);

  return router;
};

export default createLikesRouter;
