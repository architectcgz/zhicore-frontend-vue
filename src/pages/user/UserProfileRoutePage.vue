<template>
  <section class="user-profile">
    <header class="user-profile__header">
      <p class="user-profile__eyebrow">Profile</p>
      <h1 class="user-profile__title">个人信息</h1>
      <p class="user-profile__subtitle">管理你的公开资料和消息偏好。</p>
    </header>

    <div v-if="isLoading" class="user-profile__loading" aria-live="polite">
      正在加载个人信息
    </div>

    <div v-else class="user-profile__layout">
      <aside class="user-profile__summary" aria-label="资料摘要">
        <div class="user-profile__identity">
          <img
            v-if="profile.avatarUrl"
            :src="profile.avatarUrl"
            alt="用户头像"
            class="user-profile__avatar"
          />
          <div v-else class="user-profile__avatar-placeholder">
            {{ form.nickname ? form.nickname[0].toUpperCase() : "U" }}
          </div>

          <div>
            <h2>{{ form.nickname || "未设置昵称" }}</h2>
            <p>{{ profile.publicId || "用户编号暂不可用" }}</p>
          </div>
        </div>

        <dl class="user-profile__meta">
          <div>
            <dt>资料版本</dt>
            <dd>{{ profile.profileVersion || "--" }}</dd>
          </div>
          <div>
            <dt>陌生人消息</dt>
            <dd>{{ form.strangerMessageAllowed ? "允许" : "关闭" }}</dd>
          </div>
        </dl>

        <button
          type="button"
          class="user-profile__logout-btn"
          @click="handleLogout"
        >
          退出登录
        </button>
      </aside>

      <form class="user-profile__form" @submit.prevent="handleSave">
        <div class="user-profile__section-title">
          <h2>公开资料</h2>
          <p>这些信息会出现在你的用户主页和内容作者区域。</p>
        </div>

        <div class="user-profile__field">
          <label for="profile-nickname">昵称</label>
          <input
            id="profile-nickname"
            v-model="form.nickname"
            type="text"
            placeholder="请输入昵称"
            required
            :aria-invalid="Boolean(fieldErrors.nickname)"
            :aria-describedby="
              fieldErrors.nickname ? 'profile-nickname-error' : undefined
            "
          />
          <p
            v-if="fieldErrors.nickname"
            id="profile-nickname-error"
            class="user-profile__field-error"
          >
            {{ fieldErrors.nickname }}
          </p>
        </div>

        <div class="user-profile__field">
          <label for="profile-bio">个人简介</label>
          <textarea
            id="profile-bio"
            v-model="form.bio"
            placeholder="介绍一下你自己..."
            rows="4"
            :aria-invalid="Boolean(fieldErrors.bio)"
            :aria-describedby="
              fieldErrors.bio ? 'profile-bio-error' : undefined
            "
          ></textarea>
          <p
            v-if="fieldErrors.bio"
            id="profile-bio-error"
            class="user-profile__field-error"
          >
            {{ fieldErrors.bio }}
          </p>
        </div>

        <div
          class="user-profile__section-title user-profile__section-title--spaced"
        >
          <h2>消息偏好</h2>
          <p>控制其他用户与你建立私信联系的方式。</p>
        </div>

        <div class="user-profile__preference-row">
          <div>
            <h3>陌生人消息</h3>
            <p>允许未建立关系的用户向你发送私信。</p>
          </div>
          <label class="toggle-label">
            <input
              type="checkbox"
              v-model="form.strangerMessageAllowed"
              class="toggle-input"
            />
            <span class="toggle-text">允许接收陌生人消息</span>
          </label>
        </div>

        <div class="user-profile__actions">
          <button
            type="submit"
            class="user-profile__submit-btn"
            :disabled="isSaving"
          >
            {{ isSaving ? "保存中..." : "保存修改" }}
          </button>
        </div>

        <p v-if="successMessage" class="user-profile__success">
          {{ successMessage }}
        </p>
        <p v-if="errorMessage" class="user-profile__error">
          {{ errorMessage }}
        </p>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ApiError } from "@/api/request";
import { getMe, updateProfile } from "@/api/user";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const router = useRouter();

const profile = ref({
  avatarUrl: "",
  publicId: "",
  profileVersion: 0,
});

const form = ref({
  nickname: "",
  bio: "",
  strangerMessageAllowed: false,
});

const isLoading = ref(true);
const isSaving = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const fieldErrors = ref({
  nickname: "",
  bio: "",
});
let successMessageTimer: ReturnType<typeof setTimeout> | undefined;

// 用户资料页开发期临时关闭页面内登录态重定向，便于在接口和登录态联调前调试页面。
const profileAuthRedirectEnabled = false;

onMounted(async () => {
  if (profileAuthRedirectEnabled && !authStore.isLoggedIn) {
    router.push("/auth/login");
    return;
  }

  try {
    const userMe = await getMe();
    profile.value.avatarUrl = userMe.avatarUrl || "";
    profile.value.publicId = userMe.publicId;
    profile.value.profileVersion = userMe.profileVersion;
    form.value.nickname = userMe.nickname || "";
    form.value.bio = userMe.bio || "";
    form.value.strangerMessageAllowed = userMe.strangerMessageAllowed ?? false;
  } catch (error: unknown) {
    errorMessage.value = parseUserProfileApiError(error).formError;
  } finally {
    isLoading.value = false;
  }
});

const handleSave = async () => {
  if (isSaving.value) {
    return;
  }

  isSaving.value = true;
  successMessage.value = "";
  errorMessage.value = "";
  clearFieldErrors();

  try {
    const updated = await updateProfile({
      nickname: form.value.nickname,
      bio: form.value.bio,
      strangerMessageAllowed: form.value.strangerMessageAllowed,
    });

    successMessage.value = "信息更新成功";
    profile.value.avatarUrl = updated.avatarUrl || "";
    profile.value.publicId = updated.publicId;
    profile.value.profileVersion = updated.profileVersion;
    form.value.nickname = updated.nickname || "";
    form.value.bio = updated.bio || "";
    form.value.strangerMessageAllowed = updated.strangerMessageAllowed ?? false;

    clearSuccessMessageTimer();
    successMessageTimer = setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (error: unknown) {
    const parsed = parseUserProfileApiError(error);
    fieldErrors.value = parsed.fieldErrors;
    errorMessage.value = parsed.formError;
  } finally {
    isSaving.value = false;
  }
};

const handleLogout = () => {
  authStore.logout();
  router.push("/auth/login");
};

function clearSuccessMessageTimer(): void {
  if (successMessageTimer) {
    clearTimeout(successMessageTimer);
    successMessageTimer = undefined;
  }
}

function clearFieldErrors(): void {
  fieldErrors.value = {
    nickname: "",
    bio: "",
  };
}

function parseUserProfileApiError(error: unknown): {
  formError: string;
  fieldErrors: typeof fieldErrors.value;
} {
  const parsed = {
    formError: "更新失败，请稍后再试",
    fieldErrors: {
      nickname: "",
      bio: "",
    },
  };

  if (!(error instanceof ApiError)) {
    return parsed;
  }

  const message = error.message || parsed.formError;
  switch (error.code) {
    case 3005:
    case 3013:
      return {
        formError: "",
        fieldErrors: {
          ...parsed.fieldErrors,
          nickname: message,
        },
      };
    case 3014:
      return {
        formError: "",
        fieldErrors: {
          ...parsed.fieldErrors,
          bio: message,
        },
      };
    case 2006:
      return {
        ...parsed,
        formError: "请先登录后查看个人信息",
      };
    case 3001:
    case 3006:
    case 3015:
    case 1004:
      return {
        ...parsed,
        formError: message,
      };
    default:
      return {
        ...parsed,
        formError: message,
      };
  }
}

onUnmounted(clearSuccessMessageTimer);
</script>

<style scoped>
.user-profile {
  display: grid;
  gap: var(--space-8);
  max-width: 1120px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4) var(--space-12);
}

.user-profile__header {
  max-width: 760px;
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.user-profile__eyebrow {
  margin: 0 0 var(--space-2);
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.user-profile__title {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 2rem;
  font-weight: var(--font-weight-h1);
  line-height: 1.1;
}

.user-profile__subtitle {
  max-width: 520px;
  margin: var(--space-3) 0 0;
  color: var(--color-text-soft);
  font-size: 0.9375rem;
  line-height: 1.6;
}

.user-profile__loading {
  display: grid;
  min-height: 13.75rem;
  place-items: center;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-soft);
  font-size: 0.9375rem;
}

.user-profile__layout {
  display: grid;
  grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
  gap: var(--space-8);
  align-items: start;
}

.user-profile__summary {
  position: sticky;
  top: calc(var(--space-12) + var(--space-8));
  display: grid;
  gap: var(--space-6);
}

.user-profile__identity {
  display: grid;
  gap: var(--space-4);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.user-profile__identity h2 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 1.25rem;
  line-height: 1.3;
}

.user-profile__identity p {
  margin: var(--space-1) 0 0;
  color: var(--color-text-soft);
  font-size: 0.875rem;
}

.user-profile__avatar,
.user-profile__avatar-placeholder {
  width: 5.5rem;
  height: 5.5rem;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--color-border-strong);
}

.user-profile__avatar-placeholder {
  display: grid;
  place-items: center;
  background: var(--color-bg-elevated);
  color: var(--color-text-strong);
  font-size: 2rem;
  font-weight: 800;
}

.user-profile__meta {
  display: grid;
  gap: var(--space-3);
  margin: 0;
}

.user-profile__meta div {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.user-profile__meta dt {
  color: var(--color-text-soft);
  font-size: 0.8125rem;
}

.user-profile__meta dd {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 0.875rem;
  font-weight: 700;
}

.user-profile__form {
  display: grid;
  gap: var(--space-5);
  padding-left: var(--space-8);
  border-left: 1px solid var(--color-border);
}

.user-profile__section-title {
  display: grid;
  gap: var(--space-2);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.user-profile__section-title--spaced {
  margin-top: var(--space-3);
}

.user-profile__section-title h2 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 1.125rem;
}

.user-profile__section-title p {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 0.875rem;
  line-height: 1.55;
}

.user-profile__field {
  display: grid;
  gap: var(--space-2);
  max-width: 640px;
}

.user-profile__field label {
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 700;
}

.user-profile__field input,
.user-profile__field textarea {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  color: var(--color-text);
  caret-color: var(--color-primary);
  font: inherit;
  font-size: 1rem;
  resize: vertical;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.user-profile__field input:focus,
.user-profile__field textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--color-bg-hover);
  box-shadow: 0 0 0 0.125rem
    color-mix(in srgb, var(--color-primary) 14%, transparent);
}

.user-profile__field input:focus-visible,
.user-profile__field textarea:focus-visible,
.toggle-input:focus-visible,
.user-profile__submit-btn:focus-visible,
.user-profile__logout-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.user-profile__preference-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-5);
  max-width: 640px;
  padding: var(--space-4) 0 var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.user-profile__preference-row h3 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 1rem;
}

.user-profile__preference-row p {
  margin: var(--space-1) 0 0;
  color: var(--color-text-soft);
  font-size: 0.875rem;
  line-height: 1.55;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  user-select: none;
}

.toggle-input {
  appearance: none;
  flex: 0 0 auto;
  width: 2.75rem;
  height: 1.5rem;
  background: var(--color-bg-elevated-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  position: relative;
  cursor: pointer;
  outline: none;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.toggle-input::after {
  content: "";
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.125rem;
  height: 1.125rem;
  background: var(--color-text-strong);
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.toggle-input:checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.toggle-input:checked::after {
  transform: translateX(1.25rem);
}

.toggle-text {
  color: var(--color-text);
}

.user-profile__actions {
  display: flex;
  gap: var(--space-4);
  max-width: 640px;
  margin-top: var(--space-2);
}

.user-profile__submit-btn {
  background: var(--color-primary);
  color: var(--color-bg);
  border: none;
  min-height: 2.75rem;
  padding: 0 var(--space-5);
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.user-profile__submit-btn:hover:not(:disabled) {
  background: var(--color-primary-strong);
  transform: translateY(-1px);
}

.user-profile__submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.user-profile__logout-btn {
  justify-self: start;
  background: color-mix(in srgb, var(--color-danger) 10%, transparent);
  color: var(--color-danger);
  border: 1px solid color-mix(in srgb, var(--color-danger) 22%, transparent);
  min-height: 2.5rem;
  padding: 0 var(--space-4);
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.user-profile__logout-btn:hover {
  background: color-mix(in srgb, var(--color-danger) 16%, transparent);
}

.user-profile__success,
.user-profile__error {
  max-width: 640px;
  margin: 0;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 700;
}

.user-profile__success {
  border: 1px solid color-mix(in srgb, var(--color-primary) 24%, transparent);
  background: color-mix(in srgb, var(--color-primary) 9%, transparent);
  color: var(--color-primary-soft);
}

.user-profile__error {
  border: 1px solid color-mix(in srgb, var(--color-danger) 24%, transparent);
  background: color-mix(in srgb, var(--color-danger) 10%, transparent);
  color: var(--color-danger);
}

@media (max-width: 820px) {
  .user-profile {
    padding: var(--space-6) var(--space-4) var(--space-12);
  }

  .user-profile__layout {
    grid-template-columns: 1fr;
  }

  .user-profile__summary {
    position: static;
  }

  .user-profile__identity {
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
  }

  .user-profile__form {
    padding-left: 0;
    border-left: 0;
  }
}

@media (max-width: 560px) {
  .user-profile__preference-row,
  .user-profile__actions {
    align-items: stretch;
    flex-direction: column;
  }

  .user-profile__submit-btn,
  .user-profile__logout-btn {
    width: 100%;
  }
}
</style>
