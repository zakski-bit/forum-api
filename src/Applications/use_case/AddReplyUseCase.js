import NewReply from '../../Domains/replies/entities/NewReply.js';

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(userId, threadId, commentId, useCasePayload) {
    await this._threadRepository.verifyAvailableThread(threadId);
    await this._commentRepository.verifyAvailableComment(commentId);
    const newReply = new NewReply(useCasePayload);
    return this._replyRepository.addReply(newReply, commentId, userId);
  }
}

export default AddReplyUseCase;
