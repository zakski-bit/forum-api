class ToggleLikeCommentUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    const { threadId, commentId, userId } = useCasePayload;

    await this._threadRepository.verifyAvailableThread(threadId);
    await this._commentRepository.verifyAvailableComment(commentId);

    const isLiked = await this._likeRepository.isCommentLiked(userId, commentId);
    if (isLiked) {
      await this._likeRepository.unlikeComment(userId, commentId);
    } else {
      await this._likeRepository.likeComment(userId, commentId);
    }
  }

  _validatePayload(payload) {
    const { threadId, commentId, userId } = payload;
    if (!threadId || !commentId || !userId) {
      throw new Error('TOGGLE_LIKE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof threadId !== 'string'
      || typeof commentId !== 'string'
      || typeof userId !== 'string'
    ) {
      throw new Error('TOGGLE_LIKE_COMMENT_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default ToggleLikeCommentUseCase;
