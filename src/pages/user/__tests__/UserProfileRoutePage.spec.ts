import { ref } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import UserProfileRoutePage from "@/pages/user/UserProfileRoutePage.vue";

const mockActiveTab = ref("profile");
const mockForm = ref({
  nickname: "Alice",
  bio: "old bio",
  strangerMessageAllowed: true,
  avatarFileId: "avatar-1",
  avatarUrl: "https://cdn.example.com/avatar.jpg",
});
const mockFieldErrors = ref({
  nickname: "",
  bio: "",
});

const mockHandleSave = vi.fn().mockImplementation(async () => {
  if (mockForm.value.nickname === "Alice2") {
    mockFieldErrors.value.nickname = "昵称已被使用";
  }
});

vi.mock("@/features/user-profile", () => ({
  useUserProfile: () => ({
    profile: ref({
      avatarUrl: "https://cdn.example.com/avatar.jpg",
      publicId: "user_pub_1",
      profileVersion: 3,
    }),
    form: mockForm,
    tabs: [
      { id: "profile", label: "个人信息", description: "昵称、头像和简介" },
      {
        id: "message-preference",
        label: "消息偏好",
        description: "陌生人消息设置",
      },
    ],
    activeTab: mockActiveTab,
    isLoading: ref(false),
    isSaving: ref(false),
    isUploading: ref(false),
    successMessage: ref(""),
    errorMessage: ref(""),
    fieldErrors: mockFieldErrors,
    handleSave: mockHandleSave,
    handleLogout: vi.fn(),
    handleAvatarUpload: vi.fn(),
    handleAvatarRemove: vi.fn(),
    resetForm: vi.fn(),
  }),
}));

async function mountUserProfilePage() {
  mockActiveTab.value = "profile";
  mockForm.value = {
    nickname: "Alice",
    bio: "old bio",
    strangerMessageAllowed: true,
    avatarFileId: "avatar-1",
    avatarUrl: "https://cdn.example.com/avatar.jpg",
  };
  mockFieldErrors.value = {
    nickname: "",
    bio: "",
  };
  mockHandleSave.mockClear();

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/user/profile", component: UserProfileRoutePage },
      { path: "/auth/login", component: { template: "<div />" } },
    ],
  });
  await router.push("/user/profile");
  await router.isReady();

  const wrapper = mount(UserProfileRoutePage, {
    global: {
      plugins: [createPinia(), router],
    },
  });
  await flushPromises();

  return wrapper;
}

describe("UserProfileRoutePage", () => {
  it("switches settings content through the left tab list", async () => {
    const wrapper = await mountUserProfilePage();

    expect(wrapper.find("#profile-nickname").exists()).toBe(true);
    expect(wrapper.find("#profile-message-preference").exists()).toBe(false);
    expect(
      wrapper
        .find('[data-testid="user-profile-tab-profile"]')
        .attributes("aria-selected"),
    ).toBe("true");
    expect(wrapper.find(".user-profile__nav-panel").text()).not.toContain(
      "Alice",
    );

    await wrapper
      .find('[data-testid="user-profile-tab-message-preference"]')
      .trigger("click");

    expect(wrapper.find("#profile-nickname").exists()).toBe(false);
    expect(wrapper.find("#profile-message-preference").exists()).toBe(true);
    expect(
      wrapper
        .find('[data-testid="user-profile-tab-message-preference"]')
        .attributes("aria-selected"),
    ).toBe("true");
  });

  it("maps nickname ApiError codes to the nickname field", async () => {
    const wrapper = await mountUserProfilePage();

    await wrapper.find("#profile-nickname").setValue("Alice2");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.find("#profile-nickname-error").text()).toBe("昵称已被使用");
    expect(wrapper.find("#profile-nickname").attributes("aria-invalid")).toBe(
      "true",
    );
    expect(wrapper.find(".user-profile__error").exists()).toBe(false);
  });
});
