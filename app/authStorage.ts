const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const EXPIRES_IN_KEY = "expires_in";
const LOGOUT_INTENT_KEY = "spotifyed_logout_intent";

export interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export function setStoredAuth(
  accessToken: string,
  refreshToken: string,
  expiresIn: string
) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(EXPIRES_IN_KEY, expiresIn);
}

export function getStoredAuth(): StoredAuth | null {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const expiresIn = localStorage.getItem(EXPIRES_IN_KEY);

  if (!accessToken || !refreshToken || !expiresIn) {
    return null;
  }

  return { accessToken, refreshToken, expiresIn };
}

export function clearStoredAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(EXPIRES_IN_KEY);
}

export function markLogoutIntent() {
  sessionStorage.setItem(LOGOUT_INTENT_KEY, "true");
}

export function consumeLogoutIntent() {
  const hasLogoutIntent = sessionStorage.getItem(LOGOUT_INTENT_KEY) === "true";
  sessionStorage.removeItem(LOGOUT_INTENT_KEY);

  return hasLogoutIntent;
}
