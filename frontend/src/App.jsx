import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const socket = io("https://video-processing-dashboard.onrender.com");

export default function App() {
  const [file, setFile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [role, setRole] = useState("admin");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    socket.on("progress", (video) => {
      setVideos((prev) =>
        prev.map((v) => (v.id === video.id ? video : v))
      );
    });

    return () => socket.off("progress");
  }, []);

  const upload = async () => {
    if (!file) return alert("Select a video first");
    const form = new FormData();
    form.append("video", file);
    const res = await axios.post("https://video-processing-dashboard.onrender.com/upload", form);
    setVideos((prev) => [...prev, res.data]);
    setFile(null);
  };

  const theme = {
    bg: dark ? "#0b1220" : "#f4f6fb",
    panel: dark ? "#020617" : "#ffffff",
    soft: dark ? "#1e293b" : "#f1f5f9",
    text: dark ? "#e5e7eb" : "#0f172a",
    muted: dark ? "#94a3b8" : "#64748b",
    primary: "#6366f1"
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: `
          linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)),
          url("https://images.unsplash.com/photo-1557683316-973673baf926")
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: theme.text
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          width: 240,
          background: theme.panel,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          boxShadow: "2px 0 15px rgba(0,0,0,0.3)"
        }}
      >
        <h2>🎥 Video App</h2>

        {["Dashboard", "Uploads", "Analytics", "Settings"].map((item) => (
          <button
            key={item}
            style={{
              background: "transparent",
              border: "none",
              textAlign: "left",
              padding: "10px 14px",
              borderRadius: 8,
              cursor: "pointer",
              color: theme.text,
              fontSize: 15
            }}
          >
            {item}
          </button>
        ))}
      </aside>

      {/* MAIN AREA */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* TOP BAR */}
        <header
          style={{
            height: 64,
            background: theme.panel,
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 12px rgba(0,0,0,0.2)"
          }}
        >
          <h2>Video Processing Dashboard</h2>

          <div style={{ display: "flex", gap: 12 }}>
            {/* ROLE TOGGLE */}
            <div
              style={{
                display: "flex",
                background: theme.soft,
                padding: 4,
                borderRadius: 999
              }}
            >
              {["admin", "viewer"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    border: "none",
                    cursor: "pointer",
                    background: role === r ? theme.primary : "transparent",
                    color: role === r ? "#fff" : theme.muted
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* DARK MODE */}
            <button
              onClick={() => setDark(!dark)}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: "none",
                background: theme.soft,
                cursor: "pointer"
              }}
            >
              {dark ? "☀ Light" : "🌙 Dark"}
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main style={{ padding: 24, overflowY: "auto" }}>
          
          {/* UPLOAD SECTION */}
          {role === "admin" && (
            <div
              style={{
                background: theme.panel,
                padding: 20,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 24,
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
              }}
            >
              <input
                type="file"
                accept="video/mp4"
                onChange={(e) => setFile(e.target.files[0])}
              />

              <button
                onClick={upload}
                style={{
                  background: theme.primary,
                  color: "#fff",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: 8,
                  cursor: "pointer"
                }}
              >
                Upload Video
              </button>

              <span style={{ color: theme.muted }}>
                MP4 only • Real-time processing
              </span>
            </div>
          )}

          {/* ✅ ANALYTICS — CORRECT PLACE */}
          <h3 style={{ marginBottom: 12 }}>Analytics</h3>

          <div
            style={{
              width: "100%",
              height: 300,
              background: theme.panel,
              padding: 20,
              borderRadius: 12,
              marginBottom: 30,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
            }}
          >
            <ResponsiveContainer>
              <BarChart data={videos}>
                <XAxis dataKey="file" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="progress" fill={theme.primary} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* VIDEOS */}
          <h3 style={{ marginBottom: 12 }}>Uploaded Videos</h3>

          {videos.length === 0 && (
            <p style={{ color: theme.muted }}>No videos uploaded yet.</p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 20
            }}
          >
            {videos.map((v) => (
              <div
                key={v.id}
                style={{
                  background: theme.panel,
                  padding: 16,
                  borderRadius: 12,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
                }}
              >
                <p>
                  <b>Status:</b>{" "}
                  <span style={{ color: v.status === "safe" ? "green" : "orange" }}>
                    {v.status}
                  </span>
                </p>

                <p>Progress: {v.progress}%</p>

                <div
                  style={{
                    height: 6,
                    background: theme.soft,
                    borderRadius: 4,
                    overflow: "hidden",
                    marginBottom: 10
                  }}
                >
                  <div
                    style={{
                      width: `${v.progress}%`,
                      height: "100%",
                      background: "#22c55e"
                    }}
                  />
                </div>

                {v.status === "safe" && (
                  <video width="100%" controls style={{ borderRadius: 8 }}>
                    <source
                      src={`https://video-processing-dashboard.onrender.com/stream/${v.file}`}
                      type="video/mp4"
                    />
                  </video>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
