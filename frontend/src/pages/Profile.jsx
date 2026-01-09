import React, { useMemo, useState } from "react";
import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, profile, displayName } = useAuth();
  const [name, setName] = useState(profile?.displayName || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const createdAtText = useMemo(() => {
    const ts = profile?.createdAt;
    if (!ts) return "Unknown";
    const d = ts?.toDate ? ts.toDate() : null;
    return d ? d.toLocaleString() : "Unknown";
  }, [profile]);

  async function onSave(e) {
    e.preventDefault();
    setMsg("");
    setSaving(true);

    try {
      const ref = doc(db, "users", user.uid);

      if (!profile) {
        await setDoc(ref, {
          uid: user.uid,
          email: user.email || "",
          displayName: name.trim() || displayName,
          createdAt: serverTimestamp(),
        });
      } else {
        await updateDoc(ref, {
          displayName: name.trim() || displayName,
        });
      }

      setMsg("Profile updated.");
    } catch (err) {
      console.error(err);
      setMsg("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <h1 className="mb-3">Profile</h1>

      <div className="card mb-3">
        <div className="card-body">
          <div className="mb-2">
            <strong>Hello, {displayName}</strong>
          </div>
          <div className="mb-1">
            <strong>Email:</strong> {user?.email || "Unknown"}
          </div>
          <div className="mb-1">
            <strong>User ID:</strong> {user?.uid}
          </div>
          <div className="mb-1">
            <strong>Created:</strong> {createdAtText}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="h5 mb-3">Update display name</h2>

          <form onSubmit={onSave}>
            <div className="mb-3">
              <label className="form-label">Display name</label>
              <input
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your display name"
                maxLength={40}
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>

            {msg ? <div className="mt-3">{msg}</div> : null}
          </form>
        </div>
      </div>
    </div>
  );
}
