import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { scryptSync, timingSafeEqual } from "crypto";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string; // format: scrypt:hex(salt):hex(hash)
  createdAt: string;
}

/**
 * UsersStore
 * Provides simple file-backed persistence for user accounts in DATA_DIR/users.json.
 * Uses Node's built-in scrypt for password hashing to avoid native deps.
 */
export class UsersStore {
  private filePath: string;
  private items: UserRecord[] = [];

  constructor() {
    const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.filePath = path.join(dataDir, "users.json");
    this.loadFromDisk();
  }

  /**
   * Load all users from disk.
   */
  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf8");
        const parsed: any[] = JSON.parse(raw);
        this.items = parsed.map(u => ({
          ...u,
          createdAt: u.createdAt,
        }));
      } else {
        this.items = [];
        fs.writeFileSync(this.filePath, "[]", "utf8");
      }
    } catch (err) {
      console.error("Failed to load users from disk:", err);
      this.items = [];
    }
  }

  /**
   * Persist current users to disk atomically.
   */
  private saveToDisk(): void {
    const tmpPath = this.filePath + ".tmp";
    const data = JSON.stringify(this.items, null, 2);
    fs.writeFileSync(tmpPath, data, "utf8");
    fs.renameSync(tmpPath, this.filePath);
  }

  /**
   * Find user by email (case-insensitive).
   */
  async getByEmail(email: string): Promise<UserRecord | undefined> {
    const e = email.trim().toLowerCase();
    return this.items.find(u => u.email.toLowerCase() === e);
  }

  /**
   * Find user by id.
   */
  async getById(id: string): Promise<UserRecord | undefined> {
    return this.items.find(u => u.id === id);
  }

  /**
   * Create a new user with hashed password.
   */
  async createUser(email: string, password: string): Promise<UserRecord> {
    const exists = await this.getByEmail(email);
    if (exists) throw new Error("User already exists");

    const id = randomUUID();
    const passwordHash = hashPassword(password);
    const user: UserRecord = {
      id,
      email: email.trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    this.items.push(user);
    this.saveToDisk();
    return user;
  }
}

/**
 * Hash password with scrypt and random salt.
 * Stored as: scrypt:<hex(salt)>:<hex(hash)>
 */
export function hashPassword(password: string): string {
  const salt = randomUUID().replace(/-/g, "");
  const derived = scryptSync(password, salt, 64); // 64-byte key
  return `scrypt:${salt}:${Buffer.from(derived).toString("hex")}`;
}

/**
 * Verify a password against the stored scrypt hash.
 */
export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [algo, salt, hexHash] = stored.split(":");
    if (algo !== "scrypt" || !salt || !hexHash) return false;
    const derived = scryptSync(password, salt, 64);
    const given = Buffer.from(hexHash, "hex");
    return timingSafeEqual(derived, given);
  } catch {
    return false;
  }
}