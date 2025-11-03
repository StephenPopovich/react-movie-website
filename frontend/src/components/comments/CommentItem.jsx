import { useState } from "react";
import CommentForm from "./CommentForm.jsx";

// local time formatter (replaces utils/comments.js)
const formatTime = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    month: "long",   // e.g., "Oct"
    day: "numeric",   // "10"
    year: "numeric",  // "2025"
    hour: "numeric",  // 1–12, no leading zero
    minute: "2-digit",
    hour12: true,     // "4:59 PM" not 24h
  });

export default function CommentItem({
  comment,
  replies,
  onReply,
  onEdit,
  onDelete,
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="comment-card">
      <div className="comment-meta">
        <strong>{comment.author || "Anonymous"}</strong> · {formatTime(comment.createdAt)}
        {comment.updatedAt && comment.updatedAt !== comment.createdAt ? " · edited" : ""}
      </div>

      {!isEditing ? (
        <div className="comment-text">{comment.text}</div>
      ) : (
        <CommentForm
          initial={{ author: comment.author, text: comment.text }}
          onSubmit={({ author, text }) => {
            onEdit(comment.id, { author, text });
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
          placeholder="Edit your comment..."
        />
      )}

      {!isEditing && (
        <div className="comment-actions">
          <button onClick={() => setIsReplying((s) => !s)}>
            {isReplying ? "Close reply" : "Reply"}
          </button>
          <button onClick={() => setIsEditing(true)}>Edit</button>
          <button onClick={() => onDelete(comment.id)}>Delete</button>
        </div>
      )}

      {isReplying && (
        <div className="reply-block">
          <CommentForm
            onSubmit={({ author, text }) => {
              onReply(comment.id, { author, text });
              setIsReplying(false);
            }}
            onCancel={() => setIsReplying(false)}
            placeholder={`Reply to ${comment.author || "this comment"}...`}
          />
        </div>
      )}

      {replies?.length > 0 && (
        <div className="reply-block">
          {replies.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              replies={r.children || []}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
