import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { useRouter } from "vue-router";
import { ref } from "vue";
import LoginForm from "@/components/auth/LoginForm.vue";
import { useAuth } from "@/composables/useAuth";
import type { LoginCredentials } from "@/types/auth";

// Mock the useAuth composable
vi.mock("@/composables/useAuth", () => ({
  useAuth: vi.fn(() => ({
    login: vi.fn(),
    socialAuth: vi.fn(),
    loading: ref(false),
    error: ref(null),
    user: ref(null),
    token: ref(null),
    isAuthenticated: ref(false),
    authState: ref({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    }),
    isAdmin: ref(false),
    requestPasswordReset: vi.fn(),
    confirmPasswordReset: vi.fn(),
    updateProfile: vi.fn(),
    verifyEmail: vi.fn(),
    hasPermission: vi.fn(),
    clearError: vi.fn(),
  })),
}));

// Mock vue-router
vi.mock("vue-router", () => ({
  useRouter: vi.fn(),
  useRoute: vi.fn(() => ({
    query: {},
  })),
  createRouter: vi.fn(),
  createMemoryHistory: vi.fn(),
  RouterLink: {
    template: "<a><slot /></a>",
  },
}));

describe("LoginForm", () => {
  let wrapper: any;
  const mockLogin = vi.fn();
  const mockSocialAuth = vi.fn();
  const mockRouterPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      socialAuth: mockSocialAuth,
      loading: ref(false),
      error: ref(null),
      user: ref(null),
      token: ref(null),
      isAuthenticated: ref(false),
      authState: ref({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      }),
      isAdmin: ref(false),
      requestPasswordReset: vi.fn(),
      confirmPasswordReset: vi.fn(),
      updateProfile: vi.fn(),
      verifyEmail: vi.fn(),
      hasPermission: vi.fn(),
      clearError: vi.fn(),
    } as any);

    vi.mocked(useRouter).mockReturnValue({
      push: mockRouterPush,
    } as any);

    wrapper = mount(LoginForm, {
      global: {
        stubs: {
          RouterLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });
  });

  it("renders login form correctly", () => {
    expect(wrapper.find(".auth-form").exists()).toBe(true);
    expect(wrapper.find(".auth-title").text()).toBe("登录");
    expect(wrapper.find("#email").exists()).toBe(true);
    expect(wrapper.find("#password").exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it("displays validation errors for empty fields", async () => {
    const emailInput = wrapper.find("#email");
    const passwordInput = wrapper.find("#password");

    // Trigger blur on empty fields
    await emailInput.trigger("blur");
    await passwordInput.trigger("blur");

    expect(wrapper.find(".error-message").exists()).toBe(true);
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("validates email format", async () => {
    const emailInput = wrapper.find("#email");
    await emailInput.setValue("invalid-email");
    await emailInput.trigger("blur");

    expect(wrapper.text()).toContain("邮箱格式不正确");
  });

  it("validates password length", async () => {
    const passwordInput = wrapper.find("#password");
    await passwordInput.setValue("12345");
    await passwordInput.trigger("blur");

    expect(wrapper.text()).toContain("密码至少需要6个字符");
  });

  it("submits form with valid data", async () => {
    mockLogin.mockResolvedValue(undefined);

    const emailInput = wrapper.find("#email");
    const passwordInput = wrapper.find("#password");

    await emailInput.setValue("test@example.com");
    await emailInput.trigger("blur");

    await passwordInput.setValue("password123");
    await passwordInput.trigger("blur");

    await wrapper.find(".checkbox").setValue(true);

    // Verify no validation errors
    expect(wrapper.find(".error-message").exists()).toBe(false);

    // Trigger submit on form
    await wrapper.find("form").trigger("submit");

    expect(mockLogin).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
      rememberMe: true,
    });
  });

  it("shows loading state during submission", async () => {
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      socialAuth: mockSocialAuth,
      loading: ref(true),
      error: ref(null),
      user: ref(null),
      token: ref(null),
      isAuthenticated: ref(false),
      authState: ref({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: true,
        error: null,
      }),
      isAdmin: ref(false),
      requestPasswordReset: vi.fn(),
      confirmPasswordReset: vi.fn(),
      updateProfile: vi.fn(),
      verifyEmail: vi.fn(),
      hasPermission: vi.fn(),
      clearError: vi.fn(),
    } as any);

    wrapper = mount(LoginForm, {
      global: {
        stubs: {
          RouterLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.attributes("disabled")).toBeDefined();
    expect(wrapper.find(".loading-spinner").exists()).toBe(true);
  });

  it("displays error message when login fails", async () => {
    const errorMessage = "邮箱或密码错误";
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      socialAuth: mockSocialAuth,
      loading: ref(false),
      error: ref(errorMessage),
      user: ref(null),
      token: ref(null),
      isAuthenticated: ref(false),
      authState: ref({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: errorMessage,
      }),
      isAdmin: ref(false),
      requestPasswordReset: vi.fn(),
      confirmPasswordReset: vi.fn(),
      updateProfile: vi.fn(),
      verifyEmail: vi.fn(),
      hasPermission: vi.fn(),
      clearError: vi.fn(),
    } as any);

    wrapper = mount(LoginForm, {
      global: {
        stubs: {
          RouterLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    expect(wrapper.find(".error-alert").text()).toBe(errorMessage);
  });

  it("handles social authentication", async () => {
    mockSocialAuth.mockResolvedValue(undefined);

    const googleButton = wrapper.find(".social-btn.google");
    await googleButton.trigger("click");

    expect(mockSocialAuth).toHaveBeenCalledWith({
      provider: "google",
      accessToken: expect.stringContaining("mock_token_google_"),
    });
  });

  it("navigates to register page link", () => {
    const links = wrapper.findAll(".link");
    const registerLink = links.find((link: any) =>
      link.text().includes("立即注册"),
    );

    expect(registerLink).toBeDefined();
  });

  it("navigates to password reset page link", () => {
    const links = wrapper.findAll(".link");
    const resetLink = links.find((link: any) =>
      link.text().includes("忘记密码？"),
    );

    expect(resetLink).toBeDefined();
  });

  it("disables form when loading", async () => {
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      socialAuth: mockSocialAuth,
      loading: ref(true),
      error: ref(null),
      user: ref(null),
      token: ref(null),
      isAuthenticated: ref(false),
      authState: ref({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: true,
        error: null,
      }),
      isAdmin: ref(false),
      requestPasswordReset: vi.fn(),
      confirmPasswordReset: vi.fn(),
      updateProfile: vi.fn(),
      verifyEmail: vi.fn(),
      hasPermission: vi.fn(),
      clearError: vi.fn(),
    } as any);

    wrapper = mount(LoginForm, {
      global: {
        stubs: {
          RouterLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    const submitButton = wrapper.find('button[type="submit"]');
    const socialButtons = wrapper.findAll(".social-btn");

    expect(submitButton.attributes("disabled")).toBeDefined();
    socialButtons.forEach((button: any) => {
      expect(button.attributes("disabled")).toBeDefined();
    });
  });

  it("handles remember me checkbox", async () => {
    const checkbox = wrapper.find(".checkbox");
    await checkbox.setValue(true);

    expect(checkbox.element.checked).toBe(true);

    await checkbox.setValue(false);
    expect(checkbox.element.checked).toBe(false);
  });

  it("shows social auth buttons", () => {
    const googleButton = wrapper.find(".social-btn.google");
    const githubButton = wrapper.find(".social-btn.github");

    expect(googleButton.exists()).toBe(true);
    expect(githubButton.exists()).toBe(true);
    expect(googleButton.text()).toContain("Google");
    expect(githubButton.text()).toContain("GitHub");
  });
});
