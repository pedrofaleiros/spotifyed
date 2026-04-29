import "@testing-library/jest-dom/vitest";
import React from "react";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { pushMock, replaceMock } from "./test-utils/navigation";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
}));

vi.mock("next/image", () => ({
  default: ({
    alt,
    priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) =>
    React.createElement("img", { alt, ...props }),
}));

vi.mock("next/font/google", () => ({
  Roboto: () => ({ variable: "font-roboto" }),
  Poppins: () => ({ variable: "font-poppins" }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});
