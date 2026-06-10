type Emitter = { emit: (event: string, payload: unknown) => void };

const globalForIo = globalThis as unknown as { __sandistechIo?: Emitter };

/**
 * Broadcast a realtime event to all connected Socket.io clients.
 * The io server is attached to globalThis by the custom server (server.mjs),
 * which shares a process with the Next.js API routes.
 */
export function broadcast(event: string, payload: unknown) {
  try {
    globalForIo.__sandistechIo?.emit(event, payload);
  } catch {
    // Socket server not available (e.g. during build) — ignore.
  }
}
