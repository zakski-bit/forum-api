import DetailThread from '../../Domains/threads/entities/DetailThread.js';
import DetailComment from '../../Domains/comments/entities/DetailComment.js';
import DetailReply from '../../Domains/replies/entities/DetailReply.js';

class GetDetailThreadUseCase {
  constructor({
    threadRepository, commentRepository, replyRepository, likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(threadId);
    const likeCounts = this._likeRepository
      ? await this._likeRepository.getLikeCountsByThreadId(threadId)
      : [];

    const likeCountMap = new Map(
      likeCounts.map((lc) => [lc.comment_id, Number(lc.like_count)]),
    );

    const formattedComments = comments
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((comment) => {
        const commentReplies = replies
          .filter((reply) => reply.comment_id === comment.id)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map((reply) => new DetailReply({
            id: reply.id,
            content: reply.content,
            date: reply.date,
            username: reply.username,
            isDelete: reply.is_delete,
          }));

        return new DetailComment({
          id: comment.id,
          username: comment.username,
          date: comment.date,
          content: comment.content,
          isDelete: comment.is_delete,
          likeCount: likeCountMap.get(comment.id) || 0,
          replies: commentReplies,
        });
      });

    return new DetailThread({
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
      comments: formattedComments,
    });
  }
}

export default GetDetailThreadUseCase;
