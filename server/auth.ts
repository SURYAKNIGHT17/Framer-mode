import type { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { UsersStore, verifyPassword } from "./users";

/**
 * initAuth
 * Sets up session-based authentication using passport-local.
 * Provides /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/me.
 * Uses httpOnly session cookies; secure in production.
 */
export function initAuth(app: Express) {
  const users = new UsersStore();

  const SESSION_SECRET = process.env.SESSION_SECRET || "dev-session-secret";

  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: app.get("env") === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: "email", passwordField: "password" }, async (email, password, done) => {
      try {
        const user = await users.getByEmail(email);
        if (!user) return done(null, false, { message: "Invalid credentials" });
        const ok = verifyPassword(password, user.passwordHash);
        if (!ok) return done(null, false, { message: "Invalid credentials" });
        return done(null, { id: user.id, email: user.email });
      } catch (err) {
        return done(err as Error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const u = await users.getById(id);
      if (!u) return done(new Error("User not found"));
      done(null, { id: u.id, email: u.email });
    } catch (err) {
      done(err as Error);
    }
  });

  /**
   * POST /api/auth/register
   * Register a new user with email + password.
   */
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body || {};
      if (typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({ error: "Invalid request" });
      }
      if (email.length < 5 || password.length < 6) {
        return res.status(400).json({ error: "Email or password too short" });
      }
      const user = await users.createUser(email, password);
      // Auto-login after registration
      (req as any).login({ id: user.id, email: user.email }, (err: any) => {
        if (err) return res.status(500).json({ error: "Login after register failed" });
        return res.json({ id: user.id, email: user.email });
      });
    } catch (err: any) {
      if (String(err?.message || "").includes("already exists")) {
        return res.status(409).json({ error: "User already exists" });
      }
      console.error("Register error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * POST /api/auth/login
   * Authenticate user with local strategy; sets session cookie.
   */
  app.post("/api/auth/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      (req as any).login(user, (loginErr: any) => {
        if (loginErr) return next(loginErr);
        return res.json({ id: user.id, email: user.email });
      });
    })(req, res, next);
  });

  /**
   * POST /api/auth/logout
   * Destroys session and clears cookie.
   */
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    (req as any).logout?.(() => {
      req.session?.destroy(() => {
        res.json({ ok: true });
      });
    });
  });

  /**
   * GET /api/auth/me
   * Returns current user; 401 if not logged in.
   */
  app.get("/api/auth/me", (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    return res.json(user);
  });
}