// frontend/src/pages/ChatRoom.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { getAuth } from "firebase/auth";
import "../css/chatroom.css";

const ROOM_ID = "general";

function safeTrim(s) {
  return (s || "").trim();
}

function formatTime(ts) {
  try {
    const d = ts?.toDate ? ts.toDate() : null;
    if (!d) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function ChatRoom() {
  const auth = useMemo(() => getAuth(), []);

  const [displayName, setDisplayName] = useState(() => {
    return localStorage.getItem("chat_display_name") || "";
  });
  const [nameDraft, setNameDraft] = useState(displayName);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const listRef = useRef(null);

  const messagesRef = useMemo(() => {
    return collection(db, "rooms", ROOM_ID, "messages");
  }, []);

  useEffect(() => {
    const q = query(messagesRef, orderBy("createdAt", "desc"), limit(50));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .reverse();
        setMessages(rows);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [messagesRef]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  async function saveName() {
    const next = safeTrim(nameDraft);
    if (!next) return;

    const user = auth.currentUser;
    if (!user) {
      console.error("ChatRoom: No authenticated user. Sign in is required.");
      return;
    }

    setDisplayName(next);
    localStorage.setItem("chat_display_name", next);

    await addDoc(messagesRef, {
      text: `${next} has joined the chatroom.`,
      type: "system",
      name: "System",
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
  }

  async function sendMessage(e) {
    e.preventDefault();

    const text = safeTrim(message);
    const name = safeTrim(displayName);

    if (!name) return;
    if (!text) return;

    const user = auth.currentUser;
    if (!user) {
      console.error("ChatRoom: No authenticated user. Sign in is required.");
      return;
    }

    setMessage("");

    await addDoc(messagesRef, {
      text,
      name,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
  }

  return (
    <div className="chatroom-page">
      <div className="chatroom-card">
        <div className="chatroom-header">
          <div>
            <h1 className="chatroom-title">Chatroom</h1>
            <p className="chatroom-subtitle">Room: {ROOM_ID}</p>
          </div>

          <div className="chatroom-namebox">
            <label className="chatroom-label" htmlFor="displayName">
              Display name
            </label>
            <div className="chatroom-name-row">
              <input
                id="displayName"
                className="chatroom-input"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="Type your name"
                maxLength={40}
              />
              <button
                type="button"
                className="chatroom-button"
                onClick={saveName}
              >
                Save
              </button>
            </div>
          </div>
        </div>

        <div className="chatroom-body">
          <div className="chatroom-messages" ref={listRef}>
            {loading ? (
              <div className="chatroom-empty">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="chatroom-empty">
                No messages yet. Say something.
              </div>
            ) : (
              messages.map((m) => {
                const isSystem = safeTrim(m?.type) === "system";
                const mine =
                  safeTrim(displayName) &&
                  safeTrim(m?.name) === safeTrim(displayName);

                return (
                  <div
                    key={m.id}
                    className={`chatroom-message ${mine ? "mine" : ""} ${
                      isSystem ? "system" : ""
                    }`}
                  >
                    {isSystem ? (
                      <div className="chatroom-text">{m?.text}</div>
                    ) : (
                      <>
                        <div className="chatroom-meta">
                          <span className="chatroom-name">
                            {m?.name || "Anon"}
                          </span>
                          <span className="chatroom-time">
                            {formatTime(m?.createdAt)}
                          </span>
                        </div>
                        <div className="chatroom-text">{m?.text}</div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <form className="chatroom-form" onSubmit={sendMessage}>
            <input
              className="chatroom-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                safeTrim(displayName)
                  ? "Type a message..."
                  : "Set your display name first..."
              }
              disabled={!safeTrim(displayName)}
              maxLength={500}
            />
            <button
              className="chatroom-button"
              type="submit"
              disabled={!safeTrim(displayName) || !safeTrim(message)}
            >
              Send
            </button>
          </form>

          <p className="chatroom-footnote">
            This is a public demo chat. Do not post private info.
          </p>
        </div>
      </div>
    </div>
  );
}
