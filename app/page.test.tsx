import axios from "axios";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./page";
import { pushMock } from "../test-utils/navigation";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axios);

describe("login page", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
    vi.spyOn(Date, "now").mockReturnValue(1_000);
    vi.stubGlobal("alert", vi.fn());
  });

  it("renders the Spotify login screen when no token is available", async () => {
    render(<Home />);

    expect(
      await screen.findByRole("button", { name: "Entrar com Spotify" })
    ).toBeInTheDocument();
    expect(localStorage.getItem("access_token")).toBeNull();
  });

  it("stores callback tokens from the URL and routes to home", async () => {
    window.history.pushState(
      {},
      "",
      "/?access_token=access&refresh_token=refresh&expires_in=3"
    );

    render(<Home />);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/home"));
    expect(localStorage.getItem("access_token")).toBe("access");
    expect(localStorage.getItem("refresh_token")).toBe("refresh");
    expect(localStorage.getItem("expires_in")).toBe("4000");
  });

  it("routes to home when a stored access token is still valid", async () => {
    localStorage.setItem("access_token", "stored-access");
    localStorage.setItem("refresh_token", "stored-refresh");
    localStorage.setItem("expires_in", "2000");

    render(<Home />);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/home"));
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it("refreshes an expired stored access token", async () => {
    localStorage.setItem("access_token", "expired-access");
    localStorage.setItem("refresh_token", "stored-refresh");
    localStorage.setItem("expires_in", "500");
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        access_token: "new-access",
        refresh_token: "new-refresh",
        expires_in: 10,
      },
    });

    render(<Home />);

    await waitFor(() =>
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "/api/refresh_token?refresh_token=stored-refresh"
      )
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/home"));
    expect(localStorage.getItem("access_token")).toBe("new-access");
    expect(localStorage.getItem("refresh_token")).toBe("new-refresh");
    expect(localStorage.getItem("expires_in")).toBe("11000");
  });

  it("keeps the old refresh token when refresh response omits a new one", async () => {
    localStorage.setItem("access_token", "expired-access");
    localStorage.setItem("refresh_token", "stored-refresh");
    localStorage.setItem("expires_in", "500");
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        access_token: "new-access",
        expires_in: 10,
      },
    });

    render(<Home />);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/home"));
    expect(localStorage.getItem("refresh_token")).toBe("stored-refresh");
  });

  it("clears auth and shows login when refresh fails", async () => {
    localStorage.setItem("access_token", "expired-access");
    localStorage.setItem("refresh_token", "stored-refresh");
    localStorage.setItem("expires_in", "500");
    mockedAxios.get.mockRejectedValueOnce(new Error("refresh failed"));

    render(<Home />);

    expect(
      await screen.findByRole("button", { name: "Entrar com Spotify" })
    ).toBeInTheDocument();
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(alert).toHaveBeenCalledWith("Erro makeRequestToken");
  });

  it("starts Spotify login from the button", async () => {
    const assign = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, assign },
    });

    render(<Home />);

    const button = await screen.findByRole("button", {
      name: "Entrar com Spotify",
    });
    await userEvent.click(button);

    expect(assign).toHaveBeenCalledWith("/api/login");
  });
});
