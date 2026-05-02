import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SummaryPage from "./page";
import { getUserProfile } from "@/services/userServices";
import { replaceMock } from "../../test-utils/navigation";

vi.mock("@/services/userServices", () => ({
  getUserProfile: vi.fn(),
}));

vi.mock("../components/SummaryDashboard", () => ({
  default: ({ token }: { token: string }) => (
    <div data-testid="summary-dashboard">Summary for {token}</div>
  ),
}));

const mockedGetUserProfile = vi.mocked(getUserProfile);

describe("summary page", () => {
  it("redirects to login when no token is stored", async () => {
    render(<SummaryPage />);

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/"));
    expect(localStorage.getItem("access_token")).toBeNull();
  });

  it("redirects to login when the stored token is expired", async () => {
    localStorage.setItem("access_token", "expired");
    localStorage.setItem("refresh_token", "refresh");
    localStorage.setItem("expires_in", "500");

    render(<SummaryPage />);

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/"));
    expect(localStorage.getItem("refresh_token")).toBeNull();
  });

  it("loads the user profile and renders the summary dashboard", async () => {
    localStorage.setItem("access_token", "access");
    localStorage.setItem("refresh_token", "refresh");
    localStorage.setItem("expires_in", "9999999999999");
    mockedGetUserProfile.mockResolvedValue({
      id: "user-1",
      display_name: "Pedro",
      email: "pedro@example.com",
      images: [],
    });

    render(<SummaryPage />);

    await waitFor(() =>
      expect(mockedGetUserProfile).toHaveBeenCalledWith("access")
    );
    expect((await screen.findByText("Pedro")).textContent).toBe("Pedro");
    expect(screen.getByText("pedro@example.com")).toBeInTheDocument();
    expect(screen.getByTestId("summary-dashboard")).toHaveTextContent(
      "Summary for access"
    );
  });

  it("renders nothing when the profile response is empty", async () => {
    localStorage.setItem("access_token", "access");
    localStorage.setItem("refresh_token", "refresh");
    localStorage.setItem("expires_in", "9999999999999");
    mockedGetUserProfile.mockResolvedValue(undefined as never);

    const { container } = render(<SummaryPage />);

    await waitFor(() =>
      expect(mockedGetUserProfile).toHaveBeenCalledWith("access")
    );
    await waitFor(() => expect(container.firstChild).toBeNull());
  });

  it("logs out from a loaded session", async () => {
    localStorage.setItem("access_token", "access");
    localStorage.setItem("refresh_token", "refresh");
    localStorage.setItem("expires_in", "9999999999999");
    mockedGetUserProfile.mockResolvedValue({
      id: "user-1",
      display_name: "Pedro",
      email: "pedro@example.com",
      images: [],
    });

    render(<SummaryPage />);

    expect((await screen.findByText("Pedro")).textContent).toBe("Pedro");
    fireEvent.click(screen.getByRole("button", { name: "Sair" }));
    await waitFor(() => expect(localStorage.getItem("access_token")).toBeNull());
    expect(sessionStorage.getItem("spotifyed_logout_intent")).toBe("true");
    expect(replaceMock).toHaveBeenCalledWith("/");
  });

  it("clears auth and shows a retry action when the profile request fails", async () => {
    localStorage.setItem("access_token", "access");
    localStorage.setItem("refresh_token", "refresh");
    localStorage.setItem("expires_in", "9999999999999");
    mockedGetUserProfile.mockRejectedValue(new Error("bad token"));

    render(<SummaryPage />);

    expect(
      await screen.findByText("Não foi possível carregar seu perfil do Spotify.")
    ).toBeInTheDocument();
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(replaceMock).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Entrar novamente" }));
    expect(replaceMock).toHaveBeenCalledWith("/");
  });

  it("ignores a successful profile response after unmount", async () => {
    localStorage.setItem("access_token", "access");
    localStorage.setItem("refresh_token", "refresh");
    localStorage.setItem("expires_in", "9999999999999");
    let resolveProfile: (value: Awaited<ReturnType<typeof getUserProfile>>) => void =
      () => undefined;
    mockedGetUserProfile.mockReturnValue(
      new Promise((resolve) => {
        resolveProfile = resolve;
      })
    );

    const { unmount } = render(<SummaryPage />);
    await waitFor(() =>
      expect(mockedGetUserProfile).toHaveBeenCalledWith("access")
    );
    unmount();

    await act(async () => {
      resolveProfile({
        id: "user-1",
        display_name: "Pedro",
        email: "pedro@example.com",
        images: [],
      });
    });

    expect(replaceMock).not.toHaveBeenCalledWith("/");
  });

  it("ignores a failed profile response after unmount", async () => {
    localStorage.setItem("access_token", "access");
    localStorage.setItem("refresh_token", "refresh");
    localStorage.setItem("expires_in", "9999999999999");
    let rejectProfile: (error: Error) => void = () => undefined;
    mockedGetUserProfile.mockReturnValue(
      new Promise((_, reject) => {
        rejectProfile = reject;
      })
    );

    const { unmount } = render(<SummaryPage />);
    await waitFor(() =>
      expect(mockedGetUserProfile).toHaveBeenCalledWith("access")
    );
    unmount();

    await act(async () => {
      rejectProfile(new Error("late failure"));
    });

    expect(localStorage.getItem("access_token")).toBeNull();
    expect(replaceMock).not.toHaveBeenCalledWith("/");
  });
});
