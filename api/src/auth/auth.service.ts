import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";

interface RegisteredUser {
  userId: string;
  salt: Buffer;
  passwordHash: Buffer;
}

@Injectable()
export class AuthService {
  private readonly users = new Map<string, RegisteredUser>();
  private readonly sessions = new Map<string, string>();

  register(username: string, password: string): { token: string; userId: string } {
    if (this.users.has(username)) {
      throw new ConflictException("Username is already taken");
    }

    const salt = randomBytes(16);
    const userId = randomUUID();
    this.users.set(username, {
      userId,
      salt,
      passwordHash: this.hashPassword(password, salt),
    });

    return this.createSession(userId);
  }

  login(username: string, password: string): { token: string; userId: string } {
    const user = this.users.get(username);
    if (!user) {
      throw new UnauthorizedException("Invalid username or password");
    }

    const submittedHash = this.hashPassword(password, user.salt);
    if (
      submittedHash.length !== user.passwordHash.length ||
      !timingSafeEqual(submittedHash, user.passwordHash)
    ) {
      throw new UnauthorizedException("Invalid username or password");
    }

    return this.createSession(user.userId);
  }

  loginAsGhost(): { token: string; userId: string } {
    return this.createSession(randomUUID());
  }

  getUserIdForToken(token: string): string | undefined {
    return this.sessions.get(token);
  }

  private createSession(userId: string): { token: string; userId: string } {
    const token = randomUUID();
    this.sessions.set(token, userId);
    return { token, userId };
  }

  private hashPassword(password: string, salt: Buffer): Buffer {
    return createHash("sha256").update(salt).update(password, "utf8").digest();
  }
}
