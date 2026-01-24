import React, { useEffect, useMemo, useState } from "react";
import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import "../css/Profile.css";

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

// Expects "YYYY-MM-DD"
function formatDobLong(dob) {
  if (!dob) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return "";

  const y = Number(m[1]);
  const mo = Number(m[2]);
  const da = Number(m[3]);
  if (!y || mo < 1 || mo > 12 || da < 1 || da > 31) return "";

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const month = monthNames[mo - 1];
  if (!month) return "";

  const getOrdinal = (n) => {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  return `${month} ${da}${getOrdinal(da)}, ${y}`;
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

  // NEW: Bio field
  const [bio, setBio] = useState("");

  // NEW: Top 10 favorite movies (simple text list)
  const [favoriteMovies, setFavoriteMovies] = useState(() => Array.from({ length: 10 }, () => ""));

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

    // NEW: keep bio in sync
    setBio(profile?.bio || "");

    // NEW: keep favorite movies in sync (always keep 10 inputs)
    const fromProfile = Array.isArray(profile?.favoriteMovies) ? profile.favoriteMovies : [];
    const normalized = Array.from({ length: 10 }, (_, i) => (fromProfile[i] ? String(fromProfile[i]) : ""));
    setFavoriteMovies(normalized);

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

    // NEW: bio validation
    const nextBio = safeTrim(bio);

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

    // NEW: limit bio length
    if (nextBio.length > 500) return "Bio is too long (max 500 characters).";

    // NEW: validate favorite movies length and max per item
    const cleanedMovies = (favoriteMovies || [])
      .map((m) => safeTrim(m))
      .filter(Boolean);

    if (cleanedMovies.length > 10) return "Please keep favorite movies to 10 or fewer.";
    for (const m of cleanedMovies) {
      if (m.length > 80) return "Each favorite movie must be 80 characters or fewer.";
    }

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

      const cleanedFavoriteMovies = (favoriteMovies || [])
        .map((m) => safeTrim(m))
        .filter(Boolean)
        .slice(0, 10);

      const payload = {
        uid: user.uid,
        email: user.email || "",
        displayName: safeTrim(name) || displayName || "User",
        dateOfBirth: safeTrim(dateOfBirth) || null,
        country: safeTrim(country) || "",
        stateRegion: safeTrim(stateRegion) || "",
        city: safeTrim(city) || "",

        // NEW: bio saved to Firestore
        bio: safeTrim(bio) || "",

        // NEW: favorite movies saved to Firestore
        favoriteMovies: cleanedFavoriteMovies,
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

    // NEW: revert bio too
    setBio(profile?.bio || "");

    // NEW: revert favorite movies too
    const fromProfile = Array.isArray(profile?.favoriteMovies) ? profile.favoriteMovies : [];
    const normalized = Array.from({ length: 10 }, (_, i) => (fromProfile[i] ? String(fromProfile[i]) : ""));
    setFavoriteMovies(normalized);

    setEditing(false);
  }

  const savedDob = safeTrim(profile?.dateOfBirth);
  const savedAge = calcAgeFromDob(savedDob);
  const savedDobPretty = formatDobLong(savedDob);

  // NEW: saved bio for display
  const savedBio = safeTrim(profile?.bio);

  // NEW: saved favorite movies for display
  const savedFavoriteMovies = useMemo(() => {
    const list = Array.isArray(profile?.favoriteMovies) ? profile.favoriteMovies : [];
    return list.map((m) => safeTrim(m)).filter(Boolean).slice(0, 10);
  }, [profile?.favoriteMovies]);

  function updateFavoriteMovie(index, value) {
    setFavoriteMovies((prev) => {
      const next = Array.isArray(prev) ? [...prev] : Array.from({ length: 10 }, () => "");
      next[index] = value;
      return next;
    });
  }

  return (
    <div className="container py-4 profile-page" style={{ maxWidth: 720 }}>
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
                {savedDob ? (savedDobPretty || savedDob) : "Not set"}
              </div>
              <div className="mb-1">
                <strong>Age:</strong>{" "}
                {savedAge == null ? "Not set" : savedAge}
              </div>
              <div className="mb-1">
                <strong>Location:</strong> {locationText}
              </div>

              {/* NEW: BIO DISPLAY */}
              <div className="mt-3">
                <strong>Bio:</strong>
                <div className="mt-1" style={{ whiteSpace: "pre-wrap" }}>
                  {savedBio ? savedBio : "Not set"}
                </div>
              </div>

              {/* NEW: FAVORITE MOVIES DISPLAY */}
              <div className="mt-3">
                <strong>Top 10 favorite movies:</strong>
                <div className="mt-2">
                  {savedFavoriteMovies.length ? (
                    <ol className="mb-0 ps-3 favorite-movie-list">
                      {savedFavoriteMovies.map((m, idx) => (
                        <li key={`${m}-${idx}`} style={{ whiteSpace: "pre-wrap" }}>
                          {m}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div>Not set</div>
                  )}
                </div>
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

              {/* NEW: BIO FIELD */}
              <div className="mb-3 mt-3">
                <label className="form-label">Bio</label>
                <textarea
                  className="form-control"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a short bio about yourself..."
                  rows={5}
                  maxLength={500}
                />
                <div className="form-text">
                  Max 500 characters.
                </div>
              </div>

              {/* NEW: FAVORITE MOVIES FIELDS */}
              <div className="mb-3">
                <label className="form-label">Top 10 favorite movies</label>
                <div className="row g-2">
                  {favoriteMovies.map((m, idx) => (
                    <div className="col-12" key={`fav-movie-${idx}`}>
                      <input
                        className="form-control"
                        value={m}
                        onChange={(e) => updateFavoriteMovie(idx, e.target.value)}
                        placeholder={`${idx + 1}. Movie title`}
                        maxLength={80}
                      />
                    </div>
                  ))}
                </div>
                <div className="form-text">
                  Add up to 10 movie titles. Leave blank to skip a slot. Max 80 characters each.
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
