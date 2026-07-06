import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ApiError } from "@/api/request";
import { getMe, updateProfile } from "@/api/user";
import { uploadImage } from "@/api/file";
import { isLocalDemoModeEnabled } from "@/runtime/localDemoMode";
import { useAuthStore } from "@/stores/auth";

export function useUserProfile() {
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
    avatarFileId: null as string | null,
    avatarUrl: "", // For preview
  });
  const savedFormSnapshot = ref({ ...form.value });

  const tabs = [
    {
      id: "profile",
      label: "个人信息",
      description: "昵称、头像和简介",
    },
    {
      id: "message-preference",
      label: "偏好设置",
      description: "消息接收方式",
    },
  ] as const;

  const activeTab = ref<"profile" | "message-preference">("profile");

  const isLoading = ref(true);
  const isSaving = ref(false);
  const isUploading = ref(false);
  const successMessage = ref("");
  const errorMessage = ref("");
  const fieldErrors = ref({
    nickname: "",
    bio: "",
  });

  let successMessageTimer: ReturnType<typeof setTimeout> | undefined;

  const clearSuccessMessageTimer = () => {
    if (successMessageTimer) {
      clearTimeout(successMessageTimer);
      successMessageTimer = undefined;
    }
  };

  const clearFieldErrors = () => {
    fieldErrors.value = {
      nickname: "",
      bio: "",
    };
  };

  const rememberSavedForm = () => {
    savedFormSnapshot.value = { ...form.value };
  };

  const resetForm = () => {
    // 取消编辑应回到最近一次服务端确认的资料，避免把上传预览误当成已保存头像。
    form.value = { ...savedFormSnapshot.value };
    errorMessage.value = "";
    clearFieldErrors();
  };

  const parseUserProfileApiError = (error: unknown) => {
    const parsed = {
      formError: "更新失败，请稍后再试",
      fieldErrors: {
        nickname: "",
        bio: "",
      },
    };

    if (!(error instanceof ApiError)) {
      if (error instanceof Error) {
        parsed.formError = error.message;
      }
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
      default:
        return {
          ...parsed,
          formError: message,
        };
    }
  };

  onMounted(async () => {
    if (isLocalDemoModeEnabled()) {
      authStore.setLocalDemoAuth();
    }

    if (!authStore.isLoggedIn) {
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
      form.value.strangerMessageAllowed =
        userMe.strangerMessageAllowed ?? false;
      form.value.avatarFileId = userMe.avatarFileId || null;
      form.value.avatarUrl = userMe.avatarUrl || "";
      rememberSavedForm();
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
        avatarFileId: form.value.avatarFileId,
      });

      successMessage.value = "信息更新成功";
      profile.value.avatarUrl = updated.avatarUrl || "";
      profile.value.publicId = updated.publicId;
      profile.value.profileVersion = updated.profileVersion;

      form.value.nickname = updated.nickname || "";
      form.value.bio = updated.bio || "";
      form.value.strangerMessageAllowed =
        updated.strangerMessageAllowed ?? false;
      form.value.avatarFileId = updated.avatarFileId || null;
      form.value.avatarUrl = updated.avatarUrl || "";
      rememberSavedForm();

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

  const handleAvatarUpload = async (file: File) => {
    if (isUploading.value) return;
    isUploading.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    try {
      const res = await uploadImage({ file });
      form.value.avatarFileId = res.fileId;
      form.value.avatarUrl = res.url;
    } catch (error: unknown) {
      errorMessage.value =
        error instanceof Error ? error.message : "头像上传失败";
    } finally {
      isUploading.value = false;
    }
  };

  const handleAvatarRemove = () => {
    form.value.avatarFileId = null;
    form.value.avatarUrl = "";
  };

  const handleLogout = () => {
    authStore.logout();
    router.push("/auth/login");
  };

  onUnmounted(clearSuccessMessageTimer);

  return {
    profile,
    form,
    tabs,
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
  };
}
