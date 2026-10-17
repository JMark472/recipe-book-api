import { Request, Response } from "express";
import { signupService, loginService, refreshTokenService, logoutService, getUserSessionService, getCsrfTokenService } from "@/services/auth";
import { setAuthCookies, clearAuthCookies } from "@/lib/auth-cookies";

export class AuthController {
  // Get CSRF Token Function Controller
  public getCsrfToken = (req: Request, res: Response) => {
    const result = getCsrfTokenService(req, res);
    return res.status(result.code).json(result);
  };

  // Signup Function Controller
  public signup = async (req: Request, res: Response) => {
    const { name, email, password } = req.body ?? {};
    const result = await signupService(name, email, password);
    return res.status(result.code).json(result);
  }

  // Login Function Controller
  public login = async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};
    const result = await loginService(email, password);

    // Set Auth Cookies if login is successful
    if (result.code === 200 && result.data?.accessToken && result.data?.refreshToken) {
      setAuthCookies(res, { accessToken: result.data.accessToken, refreshToken: result.data.refreshToken });
    }

    return res.status(result.code).json(result);
  }

  // Refresh Token Function Controller
  public refreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
    const result = await refreshTokenService(refreshToken);

    // Set Auth Cookies if refresh token is successful
    if (result.code === 200 && result.data?.accessToken && result.data?.refreshToken) {
      setAuthCookies(res, { accessToken: result.data.accessToken, refreshToken: result.data.refreshToken });
    }

    return res.status(result.code).json(result);
  }

  // Logout Function Controller
  public logout = async (req: Request, res: Response) => {
    const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
    const result = await logoutService(refreshToken);
    if (result.code === 200) {
      clearAuthCookies(res);
    }
    return res.status(result.code).json(result);
  }

  // Get Current User Session
  public userSession = async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub;
    const result = await getUserSessionService(userId);
    return res.status(result.code).json(result);
  };
}
