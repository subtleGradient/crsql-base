import { describe, it, expect } from "vitest";
import { nanoid, customAlphabet, urlAlphabet } from "nanoid";

describe("id generation", () => {
  it("should generate unique IDs", () => {
    const id1 = nanoid();
    const id2 = nanoid();
    
    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
  });

  it("should generate IDs of specified length", () => {
    const id = nanoid(10);
    expect(id.length).toBe(10);
    
    const longId = nanoid(32);
    expect(longId.length).toBe(32);
  });

  it("should use custom alphabet", () => {
    const customNanoid = customAlphabet("0123456789", 10);
    const id = customNanoid();
    
    expect(id.length).toBe(10);
    expect(/^[0-9]+$/.test(id)).toBe(true);
  });

  it("should generate URL-safe IDs", () => {
    const id = nanoid();
    
    // Check that ID only contains URL-safe characters
    for (const char of id) {
      expect(urlAlphabet).toContain(char);
    }
  });

  it("should generate many unique IDs without collision", () => {
    const ids = new Set();
    const count = 10000;
    
    for (let i = 0; i < count; i++) {
      ids.add(nanoid());
    }
    
    expect(ids.size).toBe(count);
  });
});