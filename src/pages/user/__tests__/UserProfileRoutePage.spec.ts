import { flushPromises, mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import { ApiError } from "@/api/request";
import { getMe, updateProfile } from "@/api/user";
import UserProfileRoutePage from "@/pages/user/UserProfileRoutePage.vue";

vi.mock("@/api/user", () => ({
  getMe: vi.fn(),
  updateProfile: vi.fn(),
}));

async function mountUserProfilePage() {
  vi.mocked(getMe).mockResolvedValue({
    publicId: "user_pub_1",
    nickname: "Alice",
    avatarFileId: "avatar-1",
    avatarUrl: "https://cdn.example.com/avatar.jpg",
    bio: "old bio",
    strangerMessageAllowed: true,
    profileVersion: 3,
  });

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
  it("maps nickname ApiError codes to the nickname field", async () => {
    const wrapper = await mountUserProfilePage();
    vi.mocked(updateProfile).mockRejectedValue(
      new ApiError("昵称已被使用", { status: 409, code: 3005 }),
    );

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
