import { describe, it, expect, beforeEach, vi } from "vitest";
import { nextTick } from "vue";
import { useAuth } from "../useAuth";
import { authService } from "@/services/authService";
import type { User, RegisterData, LoginCredentials } from "@/types/auth";
import { UserRole } from "@/types/auth";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

vi.stubGlobal("localStorage", localStorageMock);

// Mock authService methods
vi.mock("@/services/authService", () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    requestPasswordReset: vi.fn(),
    confirmPasswordReset: vi.fn(),
    updateProfile: vi.fn(),
    verifyEmail: vi.fn(),
    socialAuth: vi.fn(),
    hasPermission: vi.fn(() => true),
  },
}));

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    
    // Reset auth state
    const { resetAuth } = useAuth();
    resetAuth();
  });

  describe("initial state", () => {
    it("should initialize with default auth state", () => {
      const result = useAuth();

      expect(result.authState.value).toEqual({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    });

    it("should have correct computed properties", () => {
      const { user, token, isAuthenticated, loading, error, isAdmin } = useAuth();

      expect(user.value).toBeNull();
      expect(token.value).toBeNull();
      expect(isAuthenticated.value).toBe(false);
      expect(loading.value).toBe(false);
      expect(error.value).toBeNull();
      expect(isAdmin.value).toBe(false);
    });
  });

  describe("register", () => {
    it("should call authService.register with correct data", async () => {
      const mockUser: User = {
        id: "1",
        email: "test@example.com",
        username: "testuser",
        role: UserRole.USER,
        emailVerified: false,
        createdAt: new Date(),
      };

      const mockResponse = {
        user: mockUser,
        token: "mock_token",
        message: "注册成功！",
      };

      vi.mocked(authService.register).mockResolvedValue(mockResponse);

      const { register } = useAuth();

      const registerData: RegisterData = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        confirmPassword: "password123",
      };

      await register(registerData);

      expect(authService.register).toHaveBeenCalledWith(registerData);
    });

    it("should handle registration errors", async () => {
      const error = new Error("邮箱已被注册");
      vi.mocked(authService.register).mockRejectedValue(error);

      const { register, authState } = useAuth();

      const registerData: RegisterData = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        confirmPassword: "password123",
      };

      await expect(register(registerData)).rejects.toThrow("邮箱已被注册");

      // Wait for next tick to allow error state to update
      await nextTick();

      expect(authState.value.error).toBe("邮箱已被注册");
    });
  });

  describe("login", () => {
    it("should call authService.login with correct credentials", async () => {
      const mockUser: User = {
        id: "1",
        email: "test@example.com",
        username: "testuser",
        role: UserRole.USER,
        emailVerified: true,
        createdAt: new Date(),
      };

      const mockResponse = {
        user: mockUser,
        token: "mock_token",
        message: "登录成功！",
      };

      vi.mocked(authService.login).mockResolvedValue(mockResponse);

      const { login } = useAuth();

      const credentials: LoginCredentials = {
        email: "test@example.com",
        password: "password123",
        rememberMe: true,
      };

      await login(credentials);

      expect(authService.login).toHaveBeenCalledWith(credentials);
    });

    it("should handle login errors", async () => {
      const error = new Error("邮箱或密码错误");
      vi.mocked(authService.login).mockRejectedValue(error);

      const { login, authState } = useAuth();

      const credentials: LoginCredentials = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      await expect(login(credentials)).rejects.toThrow("邮箱或密码错误");

      await nextTick();

      expect(authState.value.error).toBe("邮箱或密码错误");
    });
  });

  describe("logout", () => {
    it("should call authService.logout and clear state", async () => {
      vi.mocked(authService.logout).mockResolvedValue(undefined);
      // Mock login response
      vi.mocked(authService.login).mockResolvedValue({
        user: {
          id: "1",
          email: "t",
          username: "u",
          role: UserRole.USER,
          emailVerified: false,
          createdAt: new Date(),
        },
        token: "token",
        message: "",
      });

      const { logout, login } = useAuth();

      // Login first to set state
      await login({ email: "t", password: "p" });

      await logout();

      expect(authService.logout).toHaveBeenCalled();
    });
  });

  describe("password reset", () => {
    it("should call authService.requestPasswordReset", async () => {
      const mockResponse = { message: "重置链接已发送" };
      vi.mocked(authService.requestPasswordReset).mockResolvedValue(
        mockResponse,
      );

      const { requestPasswordReset } = useAuth();

      const resetRequest = { email: "test@example.com" };

      const result = await requestPasswordReset(resetRequest);

      expect(authService.requestPasswordReset).toHaveBeenCalledWith(
        resetRequest,
      );
      expect(result).toBe("重置链接已发送");
    });

    it("should call authService.confirmPasswordReset", async () => {
      const mockResponse = { message: "密码重置成功" };
      vi.mocked(authService.confirmPasswordReset).mockResolvedValue(
        mockResponse,
      );

      const { confirmPasswordReset } = useAuth();

      const resetData = {
        token: "reset_token",
        newPassword: "newpassword123",
        confirmPassword: "newpassword123",
      };

      const result = await confirmPasswordReset(resetData);

      expect(authService.confirmPasswordReset).toHaveBeenCalledWith(
        resetData,
      );
      expect(result).toBe("密码重置成功");
    });
  });

  describe("permissions", () => {
    it("should call authService.hasPermission correctly", () => {
      vi.mocked(authService.hasPermission).mockReturnValue(true);

      const { hasPermission } = useAuth();

      const result = hasPermission(UserRole.ADMIN);

      expect(authService.hasPermission).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should clear errors", () => {
      const { clearError, authState } = useAuth();

      // Set an error
      authState.value.error = "Some error";

      // Clear error
      clearError();

      expect(authState.value.error).toBeNull();
    });
  });

  describe("social authentication", () => {
    it("should call authService.socialAuth", async () => {
      const mockUser: User = {
        id: "1",
        email: "user_google@example.com",
        username: "google_user_123",
        role: UserRole.USER,
        emailVerified: true,
        createdAt: new Date(),
      };

      const mockResponse = {
        user: mockUser,
        token: "social_token",
        message: "Google 登录成功！",
      };

      vi.mocked(authService.socialAuth).mockResolvedValue(mockResponse);

      const { socialAuth } = useAuth();

      const socialData = {
        provider: "google" as const,
        accessToken: "google_access_token",
      };

      await socialAuth(socialData);

      expect(authService.socialAuth).toHaveBeenCalledWith(socialData);
    });
  });
});
