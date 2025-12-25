const express = require("express");
const http = require("http");
const cors = require("cors");
const multer = require("multer");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const upload = multer({
  dest: path.join(__dirname, "uploads")
});

let videos = [];

io.on("connection", () => {
  console.log("Socket connected");
});

app.post("/upload", upload.single("video"), (req, res) => {
  const video = {
    id: Date.now().toString(),
    file: req.file.filename,
    status: "processing",
    progress: 0
  };

  videos.push(video);

  // Send initial response immediately
  res.json(video);

  let progress = 0;

  const interval = setInterval(() => {
    progress += 20;

    if (progress >= 100) {
      progress = 100;
      video.progress = 100;
      video.status = "safe";

      // ✅ FINAL EMIT (THIS WAS MISSING)
      io.emit("progress", { ...video });

      clearInterval(interval);
    } else {
      video.progress = progress;

      // Intermediate updates
      io.emit("progress", { ...video });
    }
  }, 1000);
});

app.get("/stream/:file", (req, res) => {
  res.sendFile(req.params.file, {
    root: path.join(__dirname, "uploads")
  });
});

server.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
