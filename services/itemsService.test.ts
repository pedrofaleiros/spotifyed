import { describe, expect, it, vi } from "vitest";
import {
  getUserTopItemsTracks,
  ItemsTimeRange,
  UserItemsTracks,
} from "./itemsService";
import { BASE_URL } from "./userServices";

const payload: UserItemsTracks = {
  limit: 10,
  total: 1,
  offset: 0,
  next: "",
  previous: "",
  items: [],
};

describe("getUserTopItemsTracks", () => {
  it("requests top tracks with the selected period and limit", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(payload),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      getUserTopItemsTracks("token", ItemsTimeRange.medium_term, 30)
    ).resolves.toEqual(payload);

    const [url, init] = fetchMock.mock.calls[0];
    const requestedUrl = new URL(url);
    expect(`${requestedUrl.origin}${requestedUrl.pathname}`).toBe(
      `${BASE_URL}/me/top/tracks`
    );
    expect(requestedUrl.searchParams.get("time_range")).toBe("medium_term");
    expect(requestedUrl.searchParams.get("limit")).toBe("30");
    expect(init).toEqual({
      method: "GET",
      headers: { Authorization: "Bearer token" },
    });
  });

  it.each([0, -1, 51])(
    "falls back to limit 10 when the requested limit is %s",
    async (limit) => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(payload),
      });
      vi.stubGlobal("fetch", fetchMock);

      await getUserTopItemsTracks("token", ItemsTimeRange.short_term, limit);

      const [url] = fetchMock.mock.calls[0];
      expect(new URL(url).searchParams.get("limit")).toBe("10");
    }
  );

  it("throws when Spotify returns an error status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
      })
    );

    await expect(
      getUserTopItemsTracks("token", ItemsTimeRange.long_term, 10)
    ).rejects.toThrow("Falha ao obter músicas mais ouvidas (403)");
  });
});
