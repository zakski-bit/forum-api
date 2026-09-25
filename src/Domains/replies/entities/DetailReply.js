class DetailReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, content, date, username, isDelete = false,
    } = payload;

    this.id = id;
    this.content = isDelete ? '**balasan telah dihapus**' : content;
    this.date = typeof date === 'string' ? date : date.toISOString();
    this.username = username;
  }

  _verifyPayload({
    id, content, date, username,
  }) {
    if (!id || !content || !date || !username) {
      throw new Error('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof content !== 'string'
      || (typeof date !== 'string' && !(date instanceof Date))
      || typeof username !== 'string'
    ) {
      throw new Error('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default DetailReply;
