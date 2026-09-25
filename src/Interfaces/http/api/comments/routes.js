import express from 'express';
import authMiddleware from '../../../../Infrastructures/http/authMiddleware.js';

const createCommentsRouter = (handler, container) => {
  const router = express.Router();

  router.post('/:threadId/comments', authMiddleware(container), handler.postCommentHandler);
  router.delete('/:threadId/comments/:commentId', authMiddleware(container), handler.deleteCommentHandler);

  return router;
};

export default createCommentsRouter;
