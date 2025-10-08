import { useState } from "react";

export default function CommentForm({
  onSubmit, onCancel, initial = { author: "", text: "" }, placeholder = "Write your comment..."
}) {
  const [author, setAuthor] = useState(initial.author || "");
  const [text, setText] = useState(initial.text || "");

  const submit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit({ author: author.trim() || "Anonymous", text: trimmed });
    setText("");
  };

  return (
    <form className="comment-form" onSubmit={submit}>
      <input
        type="text"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Name (optional)"
        aria-label="author"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label="comment"
      />
      <div className="row">
        <button type="submit">Post</button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{ background: "#333" }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
