import React, { useEffect, useMemo, useState } from "react";
import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

function safeTrim(s) {
  return (s || "").trim();
}

// Expects "YYYY-MM-DD"
function calcAgeFromDob(dob) {
  if (!dob) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return null;

  const y = Number(m[1]);
  const mo = Number(m[2]);
  const da = Number(m[3]);

  if (!y || mo < 1 || mo > 12 || da < 1 || da > 31) return null;

  const birth = new Date(y, mo - 1, da);
  if (Number.isNaN(birth.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();

  const thisYearBirthday = new Date(
    now.getFullYear(),
    birth.getMonth(),
    birth.getDate()
  );
  if (now < thisYearBirthday) age -= 1;

  if (age < 0 || age > 130) return null;
  return age;
}

export default function Profile() {
  const { user, profile, displayName } = useAuth();

  // Editing toggle
  const [editing, setEditing] = useState(() => !profile);

  // Form fields
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(""); // YYYY-MM-DD
  const [country, setCountry] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [city, setCity] = useState("");

  // UI state
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // Keep form in sync with profile data (and update after successful save if AuthContext refreshes)
  useEffect(() => {
    setName(profile?.displayName || "");
    setDateOfBirth(profile?.dateOfBirth || "");
    setCountry(profile?.country || "");
    setStateRegion(profile?.stateRegion || "");
    setCity(profile?.city || "");

    // If profile appears for the first time, stop forcing editing view
    if (profile) setEditing(false);
  }, [profile]);

  const createdAtText = useMemo(() => {
    const ts = profile?.createdAt;
    if (!ts) return "Unknown";
    const d = ts?.toDate ? ts.toDate() : null;
    return d ? d.toLocaleString() : "Unknown";
  }, [profile]);

  const age = useMemo(() => {
    return calcAgeFromDob(safeTrim(profile?.dateOfBirth));
  }, [profile?.dateOfBirth]);

  const locationText = useMemo(() => {
    const c = safeTrim(profile?.city);
    const s = safeTrim(profile?.stateRegion);
    const co = safeTrim(profile?.country);

    const parts = [c, s, co].filter(Boolean);
    return parts.length ? parts.join(", ") : "Not set";
  }, [profile?.city, profile?.stateRegion, profile?.country]);

  function validate() {
    const nextName = safeTrim(name);
    const dob = safeTrim(dateOfBirth);
    const co = safeTrim(country);
    const st = safeTrim(stateRegion);
    const ci = safeTrim(city);

    if (!nextName) return "Display name is required.";

    if (dob) {
      const ok = /^\d{4}-\d{2}-\d{2}$/.test(dob);
      if (!ok) return "Date of birth must be in YYYY-MM-DD format.";
      if (calcAgeFromDob(dob) == null)
        return "Date of birth looks invalid. Please double check it.";
    }

    if (co.length > 56) return "Country is too long.";
    if (st.length > 56) return "State/Region is too long.";
    if (ci.length > 56) return "City is too long.";

    return "";
  }

  async function onSave(e) {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!user?.uid) {
      setError("You must be signed in to update your profile.");
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const ref = doc(db, "users", user.uid);

      const payload = {
        uid: user.uid,
        email: user.email || "",
        displayName: safeTrim(name) || displayName || "User",
        dateOfBirth: safeTrim(dateOfBirth) || null,
        country: safeTrim(country) || "",
        stateRegion: safeTrim(stateRegion) || "",
        city: safeTrim(city) || "",
      };

      if (!profile) {
        await setDoc(ref, {
          ...payload,
          createdAt: serverTimestamp(),
        });
      } else {
        await updateDoc(ref, payload);
      }

      setMsg("Profile updated.");
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  function onEdit() {
    setMsg("");
    setError("");
    setEditing(true);
  }

  function onCancelEdit() {
    setMsg("");
    setError("");

    // revert form to latest saved profile data
    setName(profile?.displayName || "");
    setDateOfBirth(profile?.dateOfBirth || "");
    setCountry(profile?.country || "");
    setStateRegion(profile?.stateRegion || "");
    setCity(profile?.city || "");

    setEditing(false);
  }

  const savedDob = safeTrim(profile?.dateOfBirth);
  const savedAge = calcAgeFromDob(savedDob);

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <h1 className="mb-3">Profile</h1>

      {/* TOP CARD: SHOW SAVED PROFILE DATA */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex align-items-start justify-content-between gap-3">
            <div>
              <div className="mb-2">
                <strong>Hello, {profile?.displayName || displayName}</strong>
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

              <hr />

              <div className="mb-1">
                <strong>Date of birth:</strong>{" "}
                {savedDob ? savedDob : "Not set"}
              </div>
              <div className="mb-1">
                <strong>Age:</strong>{" "}
                {savedAge == null ? "Not set" : savedAge}
              </div>
              <div className="mb-1">
                <strong>Location:</strong> {locationText}
              </div>
            </div>

            {/* EDIT BUTTON */}
            <div className="text-end">
              {profile && !editing ? (
                <button className="btn btn-outline-primary" type="button" onClick={onEdit}>
                  Edit Profile
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* FORM CARD (ONLY WHEN EDITING) */}
      {editing ? (
        <div className="card">
          <div className="card-body">
            <h2 className="h5 mb-3">
              {profile ? "Edit your profile" : "Create your profile"}
            </h2>

            <form onSubmit={onSave}>
              <div className="mb-3">
                <label className="form-label">Display name</label>
                <input
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your display name"
                  maxLength={50}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Date of birth</label>
                <input
                  className="form-control"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
                <div className="form-text">
                  Age is calculated automatically from your DOB.
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label">Country</label>
                  <input
                    className="form-control"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United States"
                    maxLength={56}
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label">State / Region</label>
                  <input
                    className="form-control"
                    value={stateRegion}
                    onChange={(e) => setStateRegion(e.target.value)}
                    placeholder="California"
                    maxLength={56}
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label">City</label>
                  <input
                    className="form-control"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="San Jose"
                    maxLength={56}
                  />
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 mt-3">
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>

                {profile ? (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={onCancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>

              {error ? <div className="alert alert-danger mt-3 mb-0">{error}</div> : null}
              {msg ? <div className="alert alert-success mt-3 mb-0">{msg}</div> : null}
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
