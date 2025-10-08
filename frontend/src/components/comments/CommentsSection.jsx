// /src/components/comments/CommentsSection.jsx
import { useMemo, useCallback } from "react";
import useLocalStorage from "../../hooks/useLocalStorage.js";
import { uid as genId } from "../../utils/comments.js";
import CommentForm from "./CommentForm.jsx";
import CommentItem from "./CommentItem.jsx";
import "../../css/comments.css";

/**
 * Data model (flat):
 * { id, parentId: string|null, author, text, createdAt, updatedAt }
 */
export default function CommentsSection({ movieId, title }) {
  const storageKey = `comments:${movieId}`;
  const [comments, setComments] = useLocalStorage(storageKey, []);

  // Build a nested tree for rendering threaded replies
  const tree = useMemo(() => {
    const byId = new Map();
    comments.forEach((c) => byId.set(c.id, { ...c, children: [] }));
    const roots = [];
    byId.forEach((node) => {
      if (node.parentId && byId.has(node.parentId)) {
        byId.get(node.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    // sort oldest → newest
    const sortRec = (arr) => {
      arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      arr.forEach((n) => sortRec(n.children));
    };
    sortRec(roots);
    return roots;
  }, [comments]);

  // Add new comment or reply
  const addComment = useCallback(
    (vals, parentId = null) => {
      const now = new Date().toISOString();
      setComments((prev) => [
        ...prev,
        {
          id: uid(),
          parentId,
          author: vals.author || "Anonymous",
          text: vals.text,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    },
    [setComments]
  );

  // Edit an existing comment
  const editComment = useCallback(
    (id, { author, text }) => {
      const now = new Date().toISOString();
      setComments((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, author, text, updatedAt: now } : c
        )
      );
    },
    [setComments]
  );

  // Delete comment + descendants
  const deleteComment = useCallback(
    (id) => {
      const toDelete = new Set([id]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const c of comments) {
          if (
            !toDelete.has(c.id) &&
            c.parentId &&
            toDelete.has(c.parentId)
          ) {
            toDelete.add(c.id);
            changed = true;
          }
        }
      }
      setComments((prev) => prev.filter((c) => !toDelete.has(c.id)));
    },
    [comments, setComments]
  );

  return (
    <section className="comments-wrap" aria-label="comments">
      <h2>Comments</h2>

      <CommentForm
        onSubmit={(vals) => addComment(vals, null)}
        placeholder={`Share your thoughts on “${title}”...`}
      />

      {tree.length === 0 ? (
        <div className="comment-empty">Be the first to comment.</div>
      ) : (
        tree.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            replies={c.children}
            onReply={(parentId, vals) => addComment(vals, parentId)}
            onEdit={editComment}
            onDelete={deleteComment}
          />
        ))
      )}
    </section>
  );
}
