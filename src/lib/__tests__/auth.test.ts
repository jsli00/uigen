import { test, expect, vi, beforeEach } from "vitest";
import { getSession } from "@/lib/auth";

vi.mock("server-only", () => ({}));

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

const mockJwtVerify = vi.fn();
vi.mock("jose", () => ({
  SignJWT: vi.fn(),
  jwtVerify: (...args: unknown[]) => mockJwtVerify(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test("getSession returns null when no cookie is present", async () => {
  mockCookieStore.get.mockReturnValue(undefined);
  expect(await getSession()).toBeNull();
});

test("getSession returns the session payload for a valid token", async () => {
  const payload = { userId: "user-1", email: "user@example.com" };
  mockCookieStore.get.mockReturnValue({ value: "valid.jwt.token" });
  mockJwtVerify.mockResolvedValue({ payload });

  const session = await getSession();
  expect(session?.userId).toBe("user-1");
  expect(session?.email).toBe("user@example.com");
});

test("getSession returns null when jwtVerify throws (expired token)", async () => {
  mockCookieStore.get.mockReturnValue({ value: "expired.jwt.token" });
  mockJwtVerify.mockRejectedValue(new Error("JWTExpired"));

  expect(await getSession()).toBeNull();
});

test("getSession returns null when jwtVerify throws (malformed token)", async () => {
  mockCookieStore.get.mockReturnValue({ value: "not.a.valid.jwt" });
  mockJwtVerify.mockRejectedValue(new Error("JWSInvalid"));

  expect(await getSession()).toBeNull();
});
