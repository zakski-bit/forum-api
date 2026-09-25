import ToggleLikeCommentUseCase from '../../../../Applications/use_case/ToggleLikeCommentUseCase.js';

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(req, res, next) {
    try {
      const { id: userId } = req.auth.credentials;
      const { threadId, commentId } = req.params;
      const toggleLikeCommentUseCase = this._container.getInstance(ToggleLikeCommentUseCase.name);
      await toggleLikeCommentUseCase.execute({ userId, threadId, commentId });

      res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default LikesHandler;
