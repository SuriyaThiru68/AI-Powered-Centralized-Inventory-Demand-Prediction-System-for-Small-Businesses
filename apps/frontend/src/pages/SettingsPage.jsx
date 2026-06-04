import { useEffect, useState } from "react";
import api, { getStoredUser, setStoredUser } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export default function SettingsPage() {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState({ name: "", storeName: "", headquarters: "", contact: "" });
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    api.get("/api/auth/profile").then((r) => {
      const u = r.data.data;
      setProfile({ name: u.name || "", storeName: u.storeName || "", headquarters: u.headquarters || "", contact: u.contact || "" });
    });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.put("/api/auth/profile", profile);
      const s = getStoredUser();
      if (s) { const u = { ...s, name: profile.name }; setStoredUser(u); login(u); }
      setAlert({ type: "success", text: "Saved" });
    } catch {
      setAlert({ type: "error", text: "Failed" });
    }
  };

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">{user?.email} · {user?.role}</p>
      </header>
      {alert && <div className={`alert alert-${alert.type === "success" ? "success" : "danger"}`}>{alert.text}</div>}
      <form onSubmit={save} style={{ maxWidth: 480, background: "#fff", padding: "2rem", border: "1px solid var(--border)" }}>
        {["name", "storeName", "headquarters", "contact"].map((k) => (
          <div key={k} className="form-group">
            <label className="form-label">{k}</label>
            <input className="form-control" value={profile[k]} onChange={(e) => setProfile({ ...profile, [k]: e.target.value })} />
          </div>
        ))}
        <button type="submit" className="btn btn-primary">Save Profile</button>
      </form>
    </>
  );
}
