import {
  type User,
  type LoginCredentials,
  type RegisterData,
  type AuthResponse,
  type PasswordResetRequest,
  type PasswordResetConfirm,
  type UserProfileUpdate,
  type SocialAuthData,
  type SocialProvider,
  UserRole,
} from "@/types/auth";

interface StoredUser extends User {
  passwordHash: string;
}

const USERS_STORAGE_KEY = "auth_users_v1";
const TOKENS_STORAGE_KEY = "auth_tokens_v1";

// Mock delay to simulate network requests
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Password hashing simulation (for demo purposes only)
const hashPassword = (password: string): string => {
  // Simple hash simulation - in real app, use proper hashing like bcrypt
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
};

// Token generation simulation
const generateToken = (userId: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `mock_jwt_${userId}_${timestamp}_${random}`;
};

// Load users from localStorage
const loadUsers = (): StoredUser[] => {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt),
      }));
    }
  } catch (error) {
    console.error("Failed to load users:", error);
  }
  return [];
};

// Save users to localStorage
const saveUsers = (users: StoredUser[]) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Failed to save users:", error);
  }
};

// Load tokens from localStorage
const loadTokens = (): Record<string, string> => {
  try {
    const stored = localStorage.getItem(TOKENS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Failed to load tokens:", error);
    return {};
  }
};

// Save tokens to localStorage
const saveTokens = (tokens: Record<string, string>) => {
  try {
    localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.error("Failed to save tokens:", error);
  }
};

// Find user by email
const findUserByEmail = (email: string): StoredUser | undefined => {
  const users = loadUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
};

// Find user by ID
const findUserById = (id: string): StoredUser | undefined => {
  const users = loadUsers();
  return users.find((user) => user.id === id);
};

// Validate token
const validateToken = (token: string): User | null => {
  try {
    const tokens = loadTokens();
    const userId = Object.keys(tokens).find((id) => tokens[id] === token);
    if (userId) {
      const user = findUserById(userId);
      if (user) {
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
    }
  } catch (error) {
    console.error("Token validation error:", error);
  }
  return null;
};

export const authService = {
  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    await delay(1000); // Simulate network delay

    // Validate input
    if (!data.email || !data.username || !data.password) {
      throw new Error("所有字段都是必需的");
    }

    if (data.password !== data.confirmPassword) {
      throw new Error("密码不匹配");
    }

    if (data.password.length < 6) {
      throw new Error("密码至少需要6个字符");
    }

    // Check if user already exists
    if (findUserByEmail(data.email)) {
      throw new Error("该邮箱已被注册");
    }

    const users = loadUsers();

    // Check if username is taken
    if (
      users.find(
        (user) => user.username.toLowerCase() === data.username.toLowerCase(),
      )
    ) {
      throw new Error("该用户名已被使用");
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString() + Math.floor(Math.random() * 1000).toString(),
      email: data.email.toLowerCase(),
      username: data.username,
      role: users.length === 0 ? UserRole.ADMIN : UserRole.USER, // First user is admin
      emailVerified: false, // Email verification simulation
      createdAt: new Date(),
    };

    // Store user with hashed password
    const userWithPassword: StoredUser = {
      ...newUser,
      passwordHash: hashPassword(data.password),
    };

    users.push(userWithPassword);
    saveUsers(users);

    // Generate token
    const token = generateToken(newUser.id);
    const tokens = loadTokens();
    tokens[newUser.id] = token;
    saveTokens(tokens);

    return {
      user: newUser,
      token,
      message: "注册成功！请查收邮箱验证邮件。",
    };
  },

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(800); // Simulate network delay

    if (!credentials.email || !credentials.password) {
      throw new Error("邮箱和密码都是必需的");
    }

    const users = loadUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === credentials.email.toLowerCase(),
    );

    if (!user || !("passwordHash" in user)) {
      throw new Error("邮箱或密码错误");
    }

    // Verify password
    const hashedPassword = hashPassword(credentials.password);
    if (user.passwordHash !== hashedPassword) {
      throw new Error("邮箱或密码错误");
    }

    // Generate new token
    const token = generateToken(user.id);
    const tokens = loadTokens();
    tokens[user.id] = token;
    saveTokens(tokens);

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      message: "登录成功！",
    };
  },

  // Logout user
  async logout(token: string): Promise<void> {
    await delay(300);

    const tokens = loadTokens();
    const userId = Object.keys(tokens).find((id) => tokens[id] === token);

    if (userId) {
      delete tokens[userId];
      saveTokens(tokens);
    }
  },

  // Get current user from token
  async getCurrentUser(token: string): Promise<User | null> {
    await delay(200);
    return validateToken(token);
  },

  // Request password reset
  async requestPasswordReset(
    data: PasswordResetRequest,
  ): Promise<{ message: string }> {
    await delay(1000);

    const user = findUserByEmail(data.email);
    if (!user) {
      // Don't reveal if email exists for security
      return { message: "如果邮箱存在，重置链接将发送到您的邮箱" };
    }

    // In real app, send email with reset link
    // For demo, we'll store reset token in localStorage
    const resetToken = generateToken(user.id);
    const resetTokens = JSON.parse(
      localStorage.getItem("password_reset_tokens") || "{}",
    );
    resetTokens[user.id] = {
      token: resetToken,
      expires: Date.now() + 3600000, // 1 hour
    };
    localStorage.setItem("password_reset_tokens", JSON.stringify(resetTokens));

    // console.log(`Password reset token for ${user.email}: ${resetToken}`);

    return { message: "重置链接已发送到您的邮箱" };
  },

  // Confirm password reset
  async confirmPasswordReset(
    data: PasswordResetConfirm,
  ): Promise<{ message: string }> {
    await delay(1000);

    if (data.newPassword !== data.confirmPassword) {
      throw new Error("密码不匹配");
    }

    if (data.newPassword.length < 6) {
      throw new Error("密码至少需要6个字符");
    }

    // Find reset token
    const resetTokens = JSON.parse(
      localStorage.getItem("password_reset_tokens") || "{}",
    );
    const userId = Object.keys(resetTokens).find(
      (id) => resetTokens[id].token === data.token,
    );

    if (!userId || resetTokens[userId].expires < Date.now()) {
      throw new Error("重置链接无效或已过期");
    }

    // Update password
    const users = loadUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        passwordHash: hashPassword(data.newPassword),
      };
      saveUsers(users);

      // Remove used reset token
      delete resetTokens[userId];
      localStorage.setItem(
        "password_reset_tokens",
        JSON.stringify(resetTokens),
      );
    }

    return { message: "密码重置成功" };
  },

  // Update user profile
  async updateProfile(userId: string, data: UserProfileUpdate): Promise<User> {
    await delay(800);

    const users = loadUsers();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      throw new Error("用户不存在");
    }

    const user = users[userIndex];
    const updates: Partial<User> = {};

    // Update username
    if (data.username && data.username !== user.username) {
      if (
        users.find(
          (u) =>
            u.username.toLowerCase() === data.username!.toLowerCase() &&
            u.id !== userId,
        )
      ) {
        throw new Error("用户名已被使用");
      }
      updates.username = data.username;
    }

    // Update email
    if (data.email && data.email !== user.email) {
      if (
        findUserByEmail(data.email) &&
        findUserByEmail(data.email)!.id !== userId
      ) {
        throw new Error("邮箱已被使用");
      }
      updates.email = data.email.toLowerCase();
      updates.emailVerified = false; // Require re-verification
    }

    // Update password
    if (data.newPassword) {
      if (!data.currentPassword) {
        throw new Error("需要当前密码");
      }

      if (data.newPassword !== data.confirmPassword) {
        throw new Error("新密码不匹配");
      }

      if (data.newPassword.length < 6) {
        throw new Error("新密码至少需要6个字符");
      }

      // Verify current password
      const currentPasswordHash = hashPassword(data.currentPassword);
      if (currentPasswordHash !== user.passwordHash) {
        throw new Error("当前密码错误");
      }

      // Update password hash
      users[userIndex] = {
        ...user,
        ...updates,
        passwordHash: hashPassword(data.newPassword),
      };
    } else {
      users[userIndex] = {
        ...user,
        ...updates,
      };
    }

    saveUsers(users);

    // Return updated user without password hash
    const { passwordHash, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword;
  },

  // Verify email
  async verifyEmail(token: string): Promise<{ message: string }> {
    await delay(500);

    // In real app, validate email verification token
    // For demo, we'll just mark email as verified
    const userId = token.split("_")[2]; // Extract userId from token
    const users = loadUsers();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex !== -1) {
      users[userIndex].emailVerified = true;
      saveUsers(users);
      return { message: "邮箱验证成功" };
    }

    throw new Error("验证链接无效");
  },

  // Social authentication simulation
  async socialAuth(data: SocialAuthData): Promise<AuthResponse> {
    await delay(1500); // Simulate OAuth flow

    // In real app, validate OAuth token with provider
    // For demo, create or find user based on provider
    const providerEmail = `user_${data.provider}@example.com`;
    let user = findUserByEmail(providerEmail);

    if (!user) {
      // Create new user for social auth
      const users = loadUsers();
      const newUser: StoredUser = {
        id: Date.now().toString() + Math.floor(Math.random() * 1000).toString(),
        email: providerEmail,
        username: `${data.provider}_user_${Math.floor(Math.random() * 1000)}`,
        role: UserRole.USER,
        emailVerified: true, // Social auth emails are verified
        createdAt: new Date(),
        passwordHash: "", // No password for social auth
      };
      users.push(newUser);
      saveUsers(users);
      user = newUser;
    }

    if (!user) {
      throw new Error("Failed to create user");
    }

    const token = generateToken(user.id);
    const tokens = loadTokens();
    tokens[user.id] = token;
    saveTokens(tokens);

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      message: `${data.provider} 登录成功！`,
    };
  },

  // Check if user has permission
  hasPermission(user: User | null, requiredRole?: UserRole): boolean {
    if (!user) return false;
    if (!requiredRole) return true;

    if (requiredRole === UserRole.ADMIN) {
      return user.role === UserRole.ADMIN;
    }

    return true; // USER role has access to everything except ADMIN-only features
  },
};
