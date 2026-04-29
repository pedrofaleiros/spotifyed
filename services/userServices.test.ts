import { describe, expect, it, vi } from "vitest";
import { BASE_URL, getUserProfile } from "./userServices";

describe("getUserProfile", () => {
  it("requests the current user profile with the bearer token", async () => {
    const profile = {
      id: "user-1",
      email: "user@example.com",
      display_name: "User",
      images: [{ url: "https://image.test/avatar.jpg" }],
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(profile),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getUserProfile("access-token")).resolves.toEqual(profile);
    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/me`, {
      headers: { Authorization: "Bearer access-token" },
    });
  });

  it("throws when Spotify returns an error status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      })
    );

    await expect(getUserProfile("bad-token")).rejects.toThrow(
      "Falha ao obter dados do usuário (401)"
    );
  });
});
