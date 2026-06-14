import { createServer } from "node:http";
import next from "next";
import { Server as SocketServer } from "socket.io";
import jwt from "jsonwebtoken";
import pkg from "pg";
import { config as loadEnv } from "dotenv";

loadEnv();

const { Pool } = pkg;
const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "dev-insecure-secret-change-me";
const AUTH_COOKIE = "sandistech_token";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : undefined,
  max: 5,
});

function parseCookies(cookieHeader = "") {
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim().split("="))
      .filter((p) => p.length === 2)
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

const server = createServer((req, res) => handle(req, res));

const io = new SocketServer(server, {
  cors: { origin: true, credentials: true },
});

// Expose io so Next.js API routes (same process) can broadcast events.
globalThis.__sandistechIo = io;

// Track online users: userId -> Set of socket ids
const online = new Map();

io.use((socket, nextFn) => {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    const token = cookies[AUTH_COOKIE] || socket.handshake.auth?.token;
    if (!token) return nextFn(new Error("unauthorized"));
    const payload = jwt.verify(token, JWT_SECRET);
    socket.data.user = payload;
    nextFn();
  } catch {
    nextFn(new Error("unauthorized"));
  }
});

function broadcastPresence() {
  io.emit("presence", { online: Array.from(online.keys()) });
}

io.on("connection", async (socket) => {
  const user = socket.data.user;
  // resolve display name + avatar
  let displayName = user.email;
  let avatar = null;
  try {
    const r = await pool.query(
      "SELECT full_name, avatar FROM users WHERE id = $1",
      [user.id]
    );
    if (r.rows[0]) {
      displayName = r.rows[0].full_name;
      avatar = r.rows[0].avatar;
    }
  } catch (e) {
    console.error("presence lookup failed", e.message);
  }
  socket.data.displayName = displayName;
  socket.data.avatar = avatar;

  if (!online.has(user.id)) online.set(user.id, new Set());
  online.get(user.id).add(socket.id);
  broadcastPresence();

  socket.on("join_room", (roomId) => {
    socket.rooms.forEach((r) => {
      if (r.startsWith("room:")) socket.leave(r);
    });
    socket.join(`room:${roomId}`);
    // send current presence so the joining client shows an accurate count
    socket.emit("presence", { online: Array.from(online.keys()) });
  });

  socket.on("typing", ({ roomId, isTyping }) => {
    socket.to(`room:${roomId}`).emit("typing", {
      userId: user.id,
      userName: displayName,
      isTyping,
    });
  });

  socket.on("message", async ({ roomId, message }) => {
    const text = String(message || "").trim();
    if (!text || !roomId) return;
    try {
      const r = await pool.query(
        `INSERT INTO chat_messages (room_id, user_id, message)
         VALUES ($1, $2, $3) RETURNING id, created_at`,
        [roomId, user.id, text.slice(0, 2000)]
      );
      const payload = {
        id: r.rows[0].id,
        roomId,
        message: text.slice(0, 2000),
        createdAt: r.rows[0].created_at,
        userId: user.id,
        userName: displayName,
        userAvatar: avatar,
      };
      io.to(`room:${roomId}`).emit("message", payload);
    } catch (e) {
      console.error("message persist failed", e.message);
      socket.emit("error_message", "Failed to send message");
    }
  });

  socket.on("disconnect", () => {
    const set = online.get(user.id);
    if (set) {
      set.delete(socket.id);
      if (set.size === 0) online.delete(user.id);
    }
    broadcastPresence();
  });
});

server.listen(port, hostname, () => {
  console.log(`> SandisTech News ready on http://${hostname}:${port} (dev=${dev})`);
});
