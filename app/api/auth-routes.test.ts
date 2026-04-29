import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as callbackGET } from "./callback/route";
import { GET as loginGET } from "./login/route";
import { GET as refreshGET } from "./refresh_token/route";

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    isAxiosError: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axios);

describe("Spotify API routes", () => {
  beforeEach(() => {
    process.env.SPOTIFY_CLIENT_ID = "client-id";
    process.env.SPOTIFY_CLIENT_SECRET = "client-secret";
    process.env.SPOTIFY_REDIRECT_URI = "http://localhost:3000/api/callback";
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  it("redirects login requests to Spotify authorization", async () => {
    const response = await loginGET();
    const location = response.headers.get("location");
    expect(response.status).toBe(307);
    expect(location).toContain("https://accounts.spotify.com/authorize?");

    const url = new URL(location!);
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("client_id")).toBe("client-id");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3000/api/callback"
    );
    expect(url.searchParams.get("scope")).toBe(
      "user-read-private user-read-email user-top-read playlist-modify-public"
    );
    expect(url.searchParams.get("state")).toBeTruthy();
  });

  it("rejects callback requests without code or state", async () => {
    const response = await callbackGET(
      new Request("http://localhost:3000/api/callback?code=only-code")
    );

    await expect(response.json()).resolves.toEqual({
      error: "Invalid callback parameters",
    });
    expect(response.status).toBe(400);
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it("exchanges callback code for tokens and redirects to the app", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        access_token: "access",
        refresh_token: "refresh",
        expires_in: 3600,
      },
    });

    const response = await callbackGET(
      new Request("http://localhost:3000/api/callback?code=abc&state=xyz")
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/?access_token=access&refresh_token=refresh&expires_in=3600"
    );

    const [url, params, config] = mockedAxios.post.mock.calls[0];
    expect(url).toBe("https://accounts.spotify.com/api/token");
    expect(params).toBeInstanceOf(URLSearchParams);
    expect((params as URLSearchParams).get("code")).toBe("abc");
    expect((params as URLSearchParams).get("redirect_uri")).toBe(
      "http://localhost:3000/api/callback"
    );
    expect((params as URLSearchParams).get("grant_type")).toBe(
      "authorization_code"
    );
    expect(config?.headers.Authorization).toBe(
      `Basic ${Buffer.from("client-id:client-secret").toString("base64")}`
    );
    expect(config?.headers["Content-Type"]).toBe(
      "application/x-www-form-urlencoded"
    );
  });

  it("returns 500 when callback token exchange fails", async () => {
    const error = new Error("spotify unavailable");
    mockedAxios.post.mockRejectedValueOnce(error);

    const response = await callbackGET(
      new Request("http://localhost:3000/api/callback?code=abc&state=xyz")
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Failed to retrieve tokens",
      details: {},
    });
  });

  it("rejects refresh requests without a refresh token", async () => {
    const response = await refreshGET(
      new Request("http://localhost:3000/api/refresh_token")
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Refresh token is missing",
    });
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it("refreshes an access token", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        access_token: "new-access",
        refresh_token: "new-refresh",
        expires_in: 3600,
      },
    });

    const response = await refreshGET(
      new Request("http://localhost:3000/api/refresh_token?refresh_token=old")
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      access_token: "new-access",
      refresh_token: "new-refresh",
      expires_in: 3600,
    });

    const [url, params, config] = mockedAxios.post.mock.calls[0];
    expect(url).toBe("https://accounts.spotify.com/api/token");
    expect(params).toBe("grant_type=refresh_token&refresh_token=old");
    expect(config?.headers.Authorization).toBe(
      `Basic ${Buffer.from("client-id:client-secret").toString("base64")}`
    );
    expect(config?.headers["Content-Type"]).toBe(
      "application/x-www-form-urlencoded"
    );
  });

  it("returns 500 and logs axios details when refresh fails with axios", async () => {
    mockedAxios.isAxiosError.mockReturnValueOnce(true);
    mockedAxios.post.mockRejectedValueOnce({
      message: "bad refresh",
      response: { data: { error: "invalid_grant" } },
    });

    const response = await refreshGET(
      new Request("http://localhost:3000/api/refresh_token?refresh_token=old")
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Failed to refresh token",
    });
    expect(console.log).toHaveBeenCalledWith(
      "data: ",
      JSON.stringify({ error: "invalid_grant" }, null, 2)
    );
    expect(console.log).toHaveBeenCalledWith("message: ", "bad refresh");
  });

  it("returns 500 when refresh fails with a non-axios error", async () => {
    mockedAxios.isAxiosError.mockReturnValueOnce(false);
    mockedAxios.post.mockRejectedValueOnce(new Error("network down"));

    const response = await refreshGET(
      new Request("http://localhost:3000/api/refresh_token?refresh_token=old")
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Failed to refresh token",
    });
  });
});
