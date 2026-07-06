<template>
  <section class="user-profile" aria-labelledby="user-profile-title">
    <div v-if="isLoading" class="user-profile__loading" aria-live="polite">
      <div class="user-profile__spinner"></div>
      <span>正在加载个人信息...</span>
    </div>

    <div v-else class="user-profile__layout">
      <aside class="user-profile__nav-panel" aria-label="设置导航">
        <h1 id="user-profile-title" class="user-profile__nav-title">设置</h1>

        <nav
          class="user-profile__tabs"
          aria-label="个人设置分类"
          role="tablist"
        >
          <button
            v-for="item in settingNavigation"
            :key="item.id"
            type="button"
            class="user-profile__tab"
            :class="{
              'user-profile__tab--active': item.tabId === activeTab,
              'user-profile__tab--disabled': !item.tabId,
            }"
            role="tab"
            :aria-selected="item.tabId === activeTab"
            :disabled="!item.tabId"
            :data-testid="
              item.tabId ? `user-profile-tab-${item.tabId}` : undefined
            "
            @click="selectSetting(item.tabId)"
          >
            <component
              :is="item.icon"
              class="user-profile__tab-icon"
              aria-hidden="true"
            />
            <span>{{ item.label }}</span>
          </button>
        </nav>

        <button
          type="button"
          class="user-profile__logout-btn"
          @click="handleLogout"
        >
          <LogOut class="user-profile__tab-icon" aria-hidden="true" />
          <span>退出登录</span>
        </button>
      </aside>

      <form class="user-profile__form-panel" @submit.prevent="handleSave">
        <section
          v-if="activeTab === 'profile'"
          class="user-profile__section"
          aria-labelledby="profile-public"
        >
          <header class="user-profile__section-header">
            <h2 id="profile-public" class="user-profile__section-title">
              个人资料
            </h2>
            <p class="user-profile__section-subtitle">公开资料</p>
          </header>

          <div class="user-profile__avatar-row">
            <div class="user-profile__avatar-preview-wrapper">
              <img
                v-if="form.avatarUrl"
                :src="form.avatarUrl"
                alt="用户头像预览"
                class="user-profile__avatar-preview"
              />
              <div v-else class="user-profile__avatar-placeholder">
                {{ form.nickname ? form.nickname[0].toUpperCase() : "U" }}
              </div>

              <div
                v-if="isUploading"
                class="user-profile__avatar-uploading-overlay"
              >
                <div class="user-profile__mini-spinner"></div>
              </div>
            </div>

            <div class="user-profile__avatar-copy">
              <h3>上传头像</h3>
              <p>支持 JPG、PNG 格式，文件大小不超过 2MB</p>
              <div class="user-profile__avatar-actions">
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="user-profile__file-input"
                  @change="onFileChange"
                />
                <button
                  type="button"
                  class="user-profile__btn user-profile__btn--secondary"
                  :disabled="isUploading || isSaving"
                  @click="triggerFileInput"
                >
                  <Pencil class="user-profile__btn-icon" aria-hidden="true" />
                  <span>{{ isUploading ? "正在上传..." : "更换头像" }}</span>
                </button>
                <button
                  v-if="form.avatarUrl"
                  type="button"
                  class="user-profile__btn user-profile__btn--danger"
                  :disabled="isUploading || isSaving"
                  @click="handleAvatarRemove"
                >
                  移除
                </button>
              </div>
            </div>
          </div>

          <div class="user-profile__fields">
            <div class="user-profile__field-row">
              <label for="profile-nickname" class="user-profile__field-label"
                >昵称</label
              >
              <div class="user-profile__field-control">
                <input
                  id="profile-nickname"
                  v-model="form.nickname"
                  type="text"
                  maxlength="30"
                  placeholder="请输入昵称"
                  required
                  class="user-profile__input"
                  :aria-invalid="Boolean(fieldErrors.nickname)"
                  :aria-describedby="
                    fieldErrors.nickname ? 'profile-nickname-error' : undefined
                  "
                />
                <span class="user-profile__counter"
                  >{{ nicknameLength }}/30</span
                >
                <p
                  v-if="fieldErrors.nickname"
                  id="profile-nickname-error"
                  class="user-profile__field-error"
                >
                  {{ fieldErrors.nickname }}
                </p>
              </div>
            </div>

            <div class="user-profile__field-row">
              <label for="profile-bio" class="user-profile__field-label"
                >简介</label
              >
              <div class="user-profile__field-control">
                <textarea
                  id="profile-bio"
                  v-model="form.bio"
                  maxlength="160"
                  placeholder="介绍一下你自己"
                  rows="3"
                  class="user-profile__textarea"
                  :aria-invalid="Boolean(fieldErrors.bio)"
                  :aria-describedby="
                    fieldErrors.bio ? 'profile-bio-error' : undefined
                  "
                ></textarea>
                <span
                  class="user-profile__counter user-profile__counter--textarea"
                >
                  {{ bioLength }}/160
                </span>
                <p
                  v-if="fieldErrors.bio"
                  id="profile-bio-error"
                  class="user-profile__field-error"
                >
                  {{ fieldErrors.bio }}
                </p>
              </div>
            </div>

            <div class="user-profile__field-row">
              <span class="user-profile__field-label">UID</span>
              <div class="user-profile__field-control">
                <div class="user-profile__readonly-field">
                  <AtSign
                    class="user-profile__readonly-icon"
                    aria-hidden="true"
                  />
                  <span>{{ profile.publicId || "暂无" }}</span>
                </div>
                <p class="user-profile__field-help">
                  这是你的唯一身份标识，无法更改。
                </p>
              </div>
            </div>

            <div class="user-profile__field-row">
              <span class="user-profile__field-label">资料版本</span>
              <div class="user-profile__field-control">
                <div class="user-profile__readonly-field">
                  <span>v{{ profile.profileVersion || "1" }}</span>
                </div>
                <p class="user-profile__field-help">
                  资料版本用于追踪你的资料更新记录。
                </p>
              </div>
            </div>

            <div class="user-profile__field-row">
              <span class="user-profile__field-label">偏好选择</span>
              <div class="user-profile__field-control">
                <button
                  type="button"
                  class="user-profile__select-display"
                  @click="activeTab = 'message-preference'"
                >
                  <span>{{ messagePreferenceLabel }}</span>
                  <ChevronDown
                    class="user-profile__select-icon"
                    aria-hidden="true"
                  />
                </button>
                <p class="user-profile__field-help">
                  选择你的主要消息接收方式。
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          v-if="activeTab === 'message-preference'"
          class="user-profile__section"
          aria-labelledby="profile-message-preference"
        >
          <header class="user-profile__section-header">
            <h2
              id="profile-message-preference"
              class="user-profile__section-title"
            >
              偏好设置
            </h2>
            <p class="user-profile__section-subtitle">消息接收方式</p>
          </header>

          <div class="user-profile__preference-item">
            <div class="user-profile__preference-info">
              <h3 class="user-profile__preference-title">陌生人消息</h3>
              <p class="user-profile__preference-desc">
                允许未与您建立双向关注关系的用户向您发送私信消息。
              </p>
            </div>
            <label class="user-profile__switch">
              <input
                v-model="form.strangerMessageAllowed"
                type="checkbox"
                class="user-profile__switch-input"
              />
              <span class="user-profile__switch-slider"></span>
            </label>
          </div>
        </section>

        <footer class="user-profile__actions">
          <button
            type="button"
            class="user-profile__btn user-profile__btn--secondary user-profile__cancel-btn"
            :disabled="isSaving || isUploading"
            @click="resetForm"
          >
            取消
          </button>
          <button
            type="submit"
            class="user-profile__btn user-profile__btn--primary user-profile__submit-btn"
            :disabled="isSaving || isUploading"
          >
            {{ isSaving ? "正在保存..." : "保存更改" }}
          </button>

          <div class="user-profile__save-status" aria-live="polite">
            <span
              class="user-profile__save-dot"
              :class="{
                'user-profile__save-dot--error': Boolean(errorMessage),
                'user-profile__save-dot--busy': isSaving,
              }"
            >
              <Check
                v-if="!errorMessage && !isSaving"
                class="user-profile__save-icon"
              />
            </span>
            <span>{{ saveStatusText }}</span>
          </div>
        </footer>

        <transition name="fade">
          <p
            v-if="errorMessage"
            class="user-profile__message user-profile__message--error"
            role="alert"
          >
            {{ errorMessage }}
          </p>
        </transition>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import { computed, ref } from "vue";
import {
  AtSign,
  Bell,
  Check,
  ChevronDown,
  ClipboardList,
  LockKeyhole,
  LogOut,
  Pencil,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from "@lucide/vue";

import { useUserProfile } from "@/features/user-profile";

type ProfileTabId = "profile" | "message-preference";

type SettingNavigationItem = {
  id: string;
  label: string;
  icon: Component;
  tabId?: ProfileTabId;
};

const {
  profile,
  form,
  activeTab,
  isLoading,
  isSaving,
  isUploading,
  successMessage,
  errorMessage,
  fieldErrors,
  handleSave,
  handleLogout,
  handleAvatarUpload,
  handleAvatarRemove,
  resetForm,
} = useUserProfile();

const fileInput = ref<HTMLInputElement | null>(null);

const settingNavigation: SettingNavigationItem[] = [
  { id: "profile", label: "个人资料", icon: UserRound, tabId: "profile" },
  { id: "account", label: "账户设置", icon: Settings },
  {
    id: "preference",
    label: "偏好设置",
    icon: SlidersHorizontal,
    tabId: "message-preference",
  },
  { id: "notification", label: "通知设置", icon: Bell },
  { id: "privacy", label: "隐私设置", icon: LockKeyhole },
  { id: "security", label: "安全设置", icon: ShieldCheck },
  { id: "logs", label: "日志管理", icon: ClipboardList },
];

const nicknameLength = computed(() => form.value.nickname.length);
const bioLength = computed(() => form.value.bio.length);
const messagePreferenceLabel = computed(() =>
  form.value.strangerMessageAllowed ? "允许陌生人消息" : "仅双向关注可私信",
);
const saveStatusText = computed(() => {
  if (isSaving.value) {
    return "保存中";
  }

  if (errorMessage.value) {
    return "保存失败";
  }

  return successMessage.value || "已保存";
});

const selectSetting = (tabId?: ProfileTabId) => {
  if (!tabId) {
    return;
  }

  activeTab.value = tabId;
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const selectedFile = target.files?.[0];

  if (!selectedFile) {
    return;
  }

  await handleAvatarUpload(selectedFile);
  target.value = "";
};
</script>

<style scoped>
.user-profile {
  min-height: calc(100vh - 81px);
  padding: var(--space-4) var(--space-6) var(--space-6);
}

.user-profile__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 420px;
  gap: var(--space-3);
  color: var(--color-text-soft);
  font-size: 0.875rem;
}

.user-profile__spinner,
.user-profile__mini-spinner {
  border: 2px solid color-mix(in srgb, var(--color-text) 16%, transparent);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-pill);
  animation: user-profile-spin 0.8s linear infinite;
}

.user-profile__spinner {
  width: 24px;
  height: 24px;
}

.user-profile__mini-spinner {
  width: 18px;
  height: 18px;
}

@keyframes user-profile-spin {
  to {
    transform: rotate(360deg);
  }
}

.user-profile__layout {
  display: grid;
  grid-template-columns: minmax(220px, 316px) minmax(0, 1fr);
  gap: var(--space-6);
  width: min(100%, 1448px);
  margin: 0 auto;
}

.user-profile__nav-panel,
.user-profile__form-panel {
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-bg-elevated) 74%, transparent),
    color-mix(in srgb, var(--color-bg) 86%, transparent)
  );
  border: 1px solid color-mix(in srgb, var(--color-border) 72%, transparent);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-panel);
}

.user-profile__nav-panel {
  position: sticky;
  top: calc(var(--space-10) + var(--space-8));
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: calc(100vh - 128px);
  padding: var(--space-8) var(--space-5);
}

.user-profile__nav-title {
  margin: 0 0 var(--space-8);
  color: var(--color-text-strong);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0;
}

.user-profile__tabs {
  display: grid;
  gap: var(--space-3);
  align-content: start;
}

.user-profile__tab,
.user-profile__logout-btn {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 56px;
  gap: var(--space-4);
  padding: 0 var(--space-4);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text);
  font-size: 0.9375rem;
  font-weight: 650;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
}

.user-profile__tab:hover:not(:disabled),
.user-profile__logout-btn:hover {
  background: color-mix(in srgb, var(--color-bg-hover) 74%, transparent);
  color: var(--color-text-strong);
}

.user-profile__tab:focus-visible,
.user-profile__logout-btn:focus-visible,
.user-profile__btn:focus-visible,
.user-profile__select-display:focus-visible,
.user-profile__input:focus-visible,
.user-profile__textarea:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.user-profile__tab--active {
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--color-primary) 20%, transparent),
    color-mix(in srgb, var(--color-bg-elevated-2) 82%, transparent)
  );
  border-color: color-mix(in srgb, var(--color-primary) 42%, transparent);
  color: var(--color-text-strong);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-primary) 10%, transparent),
    0 0 24px color-mix(in srgb, var(--color-primary) 18%, transparent);
}

.user-profile__tab--disabled {
  color: color-mix(in srgb, var(--color-text-soft) 72%, transparent);
  cursor: not-allowed;
}

.user-profile__tab-icon,
.user-profile__btn-icon,
.user-profile__readonly-icon,
.user-profile__select-icon {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}

.user-profile__tab--active .user-profile__tab-icon {
  color: var(--color-primary);
}

.user-profile__logout-btn {
  margin-top: var(--space-8);
  color: var(--color-text-soft);
}

.user-profile__form-panel {
  display: grid;
  min-height: calc(100vh - 128px);
  padding: var(--space-8);
}

.user-profile__section {
  display: grid;
  gap: var(--space-8);
  align-content: start;
}

.user-profile__section-header {
  display: grid;
  gap: var(--space-1);
}

.user-profile__section-title {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 1.75rem;
  font-weight: 820;
  line-height: 1.15;
  letter-spacing: 0;
}

.user-profile__section-subtitle {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 1rem;
}

.user-profile__avatar-row {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding-bottom: var(--space-8);
  border-bottom: 1px solid
    color-mix(in srgb, var(--color-border) 72%, transparent);
}

.user-profile__avatar-preview-wrapper {
  position: relative;
  display: grid;
  place-items: center;
  width: 96px;
  height: 96px;
  overflow: hidden;
  border: 2px solid
    color-mix(in srgb, var(--color-text-strong) 12%, transparent);
  border-radius: var(--radius-pill);
  background: var(--color-bg-elevated-2);
}

.user-profile__avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-profile__avatar-placeholder {
  color: var(--color-text-strong);
  font-size: 2.25rem;
  font-weight: 800;
}

.user-profile__avatar-uploading-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--color-bg) 72%, transparent);
}

.user-profile__avatar-copy {
  display: grid;
  gap: var(--space-2);
}

.user-profile__avatar-copy h3,
.user-profile__preference-title {
  margin: 0;
  color: var(--color-text-strong);
  font-size: 1rem;
  font-weight: 750;
  letter-spacing: 0;
}

.user-profile__avatar-copy p,
.user-profile__preference-desc,
.user-profile__field-help {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.user-profile__avatar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-1);
}

.user-profile__file-input {
  display: none;
}

.user-profile__fields {
  display: grid;
  gap: var(--space-4);
}

.user-profile__field-row {
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  gap: var(--space-6);
  align-items: start;
}

.user-profile__field-label {
  min-height: 44px;
  display: flex;
  align-items: center;
  color: var(--color-text-strong);
  font-size: 0.9375rem;
  font-weight: 750;
}

.user-profile__field-control {
  position: relative;
  display: grid;
  gap: var(--space-2);
}

.user-profile__input,
.user-profile__textarea,
.user-profile__readonly-field,
.user-profile__select-display {
  width: 100%;
  min-height: 44px;
  border: 1px solid color-mix(in srgb, var(--color-border) 76%, transparent);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-bg) 58%, transparent);
  color: var(--color-text-strong);
  font-size: 0.9375rem;
}

.user-profile__input,
.user-profile__textarea {
  padding: 0 var(--space-12) 0 var(--space-4);
  caret-color: var(--color-primary);
  outline: none;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
}

.user-profile__textarea {
  min-height: 92px;
  padding-top: var(--space-3);
  padding-bottom: var(--space-6);
  resize: vertical;
  line-height: 1.5;
}

.user-profile__input:focus,
.user-profile__textarea:focus {
  border-color: color-mix(in srgb, var(--color-primary) 58%, transparent);
  box-shadow: 0 0 0 1px
    color-mix(in srgb, var(--color-primary) 28%, transparent);
}

.user-profile__input[aria-invalid="true"],
.user-profile__textarea[aria-invalid="true"] {
  border-color: color-mix(in srgb, var(--color-danger) 68%, transparent);
}

.user-profile__counter {
  position: absolute;
  top: 10px;
  right: var(--space-3);
  color: var(--color-text-soft);
  font-size: 0.8125rem;
}

.user-profile__counter--textarea {
  top: auto;
  bottom: var(--space-2);
}

.user-profile__readonly-field,
.user-profile__select-display {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-4);
}

.user-profile__readonly-field {
  color: var(--color-text);
}

.user-profile__readonly-icon,
.user-profile__select-icon {
  color: var(--color-text-soft);
}

.user-profile__select-display {
  justify-content: space-between;
  cursor: pointer;
}

.user-profile__field-error {
  margin: 0;
  color: var(--color-danger);
  font-size: 0.8125rem;
  font-weight: 650;
}

.user-profile__preference-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  padding: var(--space-5);
  border: 1px solid color-mix(in srgb, var(--color-border) 70%, transparent);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-bg) 48%, transparent);
}

.user-profile__preference-info {
  display: grid;
  gap: var(--space-1);
}

.user-profile__switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 28px;
  flex: 0 0 auto;
}

.user-profile__switch-input {
  width: 0;
  height: 0;
  opacity: 0;
}

.user-profile__switch-slider {
  position: absolute;
  inset: 0;
  cursor: pointer;
  border: 1px solid color-mix(in srgb, var(--color-border) 82%, transparent);
  border-radius: var(--radius-pill);
  background-color: var(--color-bg-elevated-2);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.user-profile__switch-slider::before {
  position: absolute;
  bottom: 4px;
  left: 4px;
  width: 18px;
  height: 18px;
  content: "";
  border-radius: var(--radius-pill);
  background-color: var(--color-text-soft);
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.user-profile__switch-input:checked + .user-profile__switch-slider {
  border-color: color-mix(in srgb, var(--color-primary) 72%, transparent);
  background-color: color-mix(
    in srgb,
    var(--color-primary) 40%,
    var(--color-bg)
  );
}

.user-profile__switch-input:checked + .user-profile__switch-slider::before {
  transform: translateX(20px);
  background-color: var(--color-text-strong);
}

.user-profile__actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: 1px solid color-mix(in srgb, var(--color-border) 72%, transparent);
}

.user-profile__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  gap: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-weight: 750;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
}

.user-profile__btn:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.user-profile__btn--secondary {
  padding: 0 var(--space-5);
  border-color: color-mix(in srgb, var(--color-border) 82%, transparent);
  background: color-mix(in srgb, var(--color-bg-elevated-2) 62%, transparent);
  color: var(--color-text-strong);
}

.user-profile__btn--secondary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-bg-hover) 80%, transparent);
}

.user-profile__btn--primary {
  padding: 0 var(--space-6);
  border-color: color-mix(in srgb, var(--color-primary) 62%, transparent);
  background: color-mix(
    in srgb,
    var(--color-primary) 28%,
    var(--color-bg-elevated)
  );
  color: var(--color-primary-soft);
  box-shadow: 0 0 18px color-mix(in srgb, var(--color-primary) 18%, transparent);
}

.user-profile__btn--primary:hover:not(:disabled) {
  background: color-mix(
    in srgb,
    var(--color-primary) 38%,
    var(--color-bg-elevated)
  );
}

.user-profile__btn--danger {
  min-height: 36px;
  padding: 0 var(--space-3);
  color: var(--color-danger);
  background: transparent;
}

.user-profile__save-status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
  color: var(--color-text);
  font-size: 0.9375rem;
}

.user-profile__save-dot {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--color-primary) 52%, var(--color-bg));
  color: var(--color-text-strong);
}

.user-profile__save-dot--error {
  background: color-mix(in srgb, var(--color-danger) 42%, var(--color-bg));
}

.user-profile__save-dot--busy {
  border: 2px solid color-mix(in srgb, var(--color-primary) 24%, transparent);
  border-top-color: var(--color-primary);
  background: transparent;
  animation: user-profile-spin 0.8s linear infinite;
}

.user-profile__save-icon {
  width: 15px;
  height: 15px;
}

.user-profile__message {
  margin: var(--space-4) 0 0;
  color: var(--color-danger);
  font-size: 0.875rem;
  font-weight: 650;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.24s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 980px) {
  .user-profile {
    padding: var(--space-4) var(--space-4)
      calc(var(--space-12) + var(--space-8));
  }

  .user-profile__layout {
    grid-template-columns: 1fr;
  }

  .user-profile__nav-panel {
    position: static;
    min-height: auto;
  }

  .user-profile__tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .user-profile {
    padding-inline: var(--space-3);
  }

  .user-profile__nav-panel,
  .user-profile__form-panel {
    padding: var(--space-5);
  }

  .user-profile__tabs {
    grid-template-columns: 1fr;
  }

  .user-profile__avatar-row,
  .user-profile__preference-item,
  .user-profile__actions {
    align-items: stretch;
    flex-direction: column;
  }

  .user-profile__field-row {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }

  .user-profile__field-label {
    min-height: auto;
  }

  .user-profile__save-status {
    margin-left: 0;
  }

  .user-profile__btn,
  .user-profile__select-display {
    width: 100%;
  }
}
</style>
