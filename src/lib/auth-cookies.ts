import type { Response } from "express";
import { ENV } from "@/config/env";
import { toMilliseconds, TokenExpiry } from "@/lib/jwt";
import { csrfCookieOptions, csrfSessionCookieName, csrfTokenCookieName } from "@/lib/csrf";

// Set Auth Cookies Function
function cookieOptions(maxAge?: number) {
  const isProduction = ENV.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" as const : "lax" as const,
    path: "/",
    maxAge,
  };
}

export function setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
  res.cookie("accessToken", tokens.accessToken, cookieOptions(toMilliseconds(TokenExpiry.ACCESS_TOKEN_EXPIRES)));
  res.cookie("refreshToken", tokens.refreshToken, cookieOptions(toMilliseconds(TokenExpiry.REFRESH_TOKEN_EXPIRES)));
}

export function clearAuthCookies(res: Response) {
  const options = { ...cookieOptions(), expires: new Date(0) };
  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);
  res.clearCookie(csrfSessionCookieName, csrfCookieOptions);
  res.clearCookie(csrfTokenCookieName, csrfCookieOptions);
}
