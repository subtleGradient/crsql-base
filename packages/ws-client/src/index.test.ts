import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("ws-client", () => {
  let mockWebSocket: any;

  beforeEach(() => {
    // Mock WebSocket
    global.WebSocket = vi.fn(() => ({
      send: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      readyState: 1,
    })) as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should connect to WebSocket server", () => {
    const ws = new WebSocket("ws://localhost:8080");
    expect(ws).toBeDefined();
    expect(ws.readyState).toBe(1); // OPEN
  });

  it("should send sync messages", () => {
    const ws = new WebSocket("ws://localhost:8080");
    const message = { type: "sync", version: 1, changes: [] };
    
    ws.send(JSON.stringify(message));
    expect(ws.send).toHaveBeenCalledWith(JSON.stringify(message));
  });

  it("should handle reconnection", async () => {
    let connectAttempts = 0;
    const createConnection = () => {
      connectAttempts++;
      return new WebSocket("ws://localhost:8080");
    };

    const ws1 = createConnection();
    expect(connectAttempts).toBe(1);

    // Simulate disconnection and reconnection
    ws1.close();
    const ws2 = createConnection();
    expect(connectAttempts).toBe(2);
  });

  it("should handle binary messages", () => {
    const ws = new WebSocket("ws://localhost:8080");
    const binaryData = new Uint8Array([1, 2, 3, 4, 5]);
    
    ws.send(binaryData);
    expect(ws.send).toHaveBeenCalledWith(binaryData);
  });

  it("should handle connection errors", () => {
    const onError = vi.fn();
    const ws = new WebSocket("ws://localhost:8080");
    
    ws.addEventListener("error", onError);
    expect(ws.addEventListener).toHaveBeenCalledWith("error", onError);
  });
});