<!--
  个人设置页面
  提供个人信息编辑、头像上传、密码修改等功能
-->
<template>
  <div class="settings-page">
    <div class="settings-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1 class="page-title">
          个人设置
        </h1>
        <p class="page-description">
          管理您的个人信息和账户设置
        </p>
      </div>

      <!-- 设置内容 -->
      <div class="settings-content">
        <!-- 左侧导航 -->
        <div class="settings-nav">
          <el-menu
            v-model="activeSection"
            mode="vertical"
            @select="handleSectionChange"
          >
            <el-menu-item index="profile">
              <i class="el-icon-user" />
              <span>个人资料</span>
            </el-menu-item>
            <el-menu-item index="avatar">
              <i class="el-icon-picture" />
              <span>头像设置</span>
            </el-menu-item>
            <el-menu-item index="password">
              <i class="el-icon-lock" />
              <span>密码修改</span>
            </el-menu-item>
          </el-menu>
        </div>

        <!-- 右侧设置面板 -->
        <div class="settings-panel">
          <!-- 个人资料设置 -->
          <div
            v-if="activeSection === 'profile'"
            class="setting-section"
          >
            <div class="section-header">
              <h2>个人资料</h2>
              <p>更新您的个人信息</p>
            </div>
            <el-form
              ref="profileFormRef"
              :model="profileForm"
              :rules="profileRules"
              label-width="100px"
              class="profile-form"
            >
              <el-form-item
                label="昵称"
                prop="nickname"
              >
                <el-input
                  v-model="profileForm.nickname"
                  placeholder="请输入昵称"
                  maxlength="50"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item
                label="用户名"
                prop="username"
              >
                <el-input
                  v-model="profileForm.username"
                  placeholder="请输入用户名"
                  maxlength="30"
                  show-word-limit
                  disabled
                />
                <div class="form-tip">
                  用户名不能修改
                </div>
              </el-form-item>
              <el-form-item
                label="邮箱"
                prop="email"
              >
                <el-input
                  v-model="profileForm.email"
                  placeholder="请输入邮箱"
                  type="email"
                />
              </el-form-item>
              <el-form-item
                label="个人简介"
                prop="bio"
              >
                <el-input
                  v-model="profileForm.bio"
                  type="textarea"
                  placeholder="介绍一下自己吧..."
                  :rows="4"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item>
                <el-button 
                  type="primary" 
                  :loading="profileSaving"
                  @click="handleSaveProfile"
                >
                  保存修改
                </el-button>
                <el-button @click="handleResetProfile">
                  重置
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 头像设置 -->
          <div
            v-if="activeSection === 'avatar'"
            class="setting-section"
          >
            <div class="section-header">
              <h2>头像设置</h2>
              <p>上传或更换您的头像</p>
            </div>
            <div class="avatar-section">
              <div class="current-avatar">
                <img 
                  :src="currentAvatar || '/default-avatar.png'" 
                  alt="当前头像"
                  class="avatar-preview"
                >
                <div class="avatar-info">
                  <p class="avatar-label">
                    当前头像
                  </p>
                  <p class="avatar-tip">
                    建议尺寸：200x200 像素
                  </p>
                </div>
              </div>
              <div class="avatar-upload">
                <el-upload
                  class="avatar-uploader"
                  action="#"
                  :show-file-list="false"
                  :before-upload="handleAvatarUpload"
                  accept="image/*"
                >
                  <el-button
                    type="primary"
                    :loading="avatarUploading"
                  >
                    <i class="el-icon-upload" />
                    选择头像
                  </el-button>
                </el-upload>
                <div class="upload-tips">
                  <p>• 支持 JPG、PNG 格式</p>
                  <p>• 文件大小不超过 2MB</p>
                  <p>• 建议使用正方形图片</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 密码修改 -->
          <div
            v-if="activeSection === 'password'"
            class="setting-section"
          >
            <div class="section-header">
              <h2>密码修改</h2>
              <p>定期更换密码以保护账户安全</p>
            </div>
            <el-form
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              label-width="120px"
              class="password-form"
            >
              <el-form-item
                label="当前密码"
                prop="currentPassword"
              >
                <el-input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  placeholder="请输入当前密码"
                  show-password
                />
              </el-form-item>
              <el-form-item
                label="新密码"
                prop="newPassword"
              >
                <el-input
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="请输入新密码"
                  show-password
                />
              </el-form-item>
              <el-form-item
                label="确认新密码"
                prop="confirmPassword"
              >
                <el-input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-button 
                  type="primary" 
                  :loading="passwordSaving"
                  @click="handleChangePassword"
                >
                  修改密码
                </el-button>
                <el-button @click="handleResetPassword">
                  重置
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import { useUser } from '@/composables/useUser';

// 认证状态
const authStore = useAuthStore();

// 组合式函数
const { updateUserProfile, changePassword, uploadAvatar } = useUser();

// 响应式状态
const activeSection = ref('profile');
const profileSaving = ref(false);
const passwordSaving = ref(false);
const avatarUploading = ref(false);
const currentAvatar = ref('');

// 表单引用
const profileFormRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();

// 个人资料表单
const profileForm = reactive({
  nickname: '',
  username: '',
  email: '',
  bio: '',
  avatarId: '', // 头像文件ID
});

// 密码修改表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// 表单验证规则
const profileRules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 50, message: '昵称长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  bio: [
    { max: 200, message: '个人简介不能超过 200 个字符', trigger: 'blur' },
  ],
};

const passwordRules: FormRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度至少 8 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

// 生命周期
onMounted(() => {
  loadUserData();
});

/**
 * 加载用户数据
 */
const loadUserData = () => {
  const user = authStore.user;
  if (user) {
    profileForm.nickname = user.nickname;
    profileForm.username = user.username;
    profileForm.email = user.email;
    profileForm.bio = user.bio || '';
    currentAvatar.value = user.avatar || '';
  }
};

/**
 * 处理设置分类切换
 */
const handleSectionChange = (section: string) => {
  activeSection.value = section;
};

/**
 * 处理保存个人资料
 */
const handleSaveProfile = async () => {
  if (!profileFormRef.value) return;
  if (!authStore.user?.id) {
    ElMessage.error('用户信息不存在');
    return;
  }

  try {
    await profileFormRef.value.validate();
    
    profileSaving.value = true;
    
    const success = await updateUserProfile(authStore.user.id, {
      nickname: profileForm.nickname,
      email: profileForm.email,
      bio: profileForm.bio,
      avatarId: profileForm.avatarId, // 传递 fileId 给后端
    });

    if (success) {
      ElMessage.success('个人资料更新成功');
    }
  } catch (error) {
    console.error('保存个人资料失败:', error);
  } finally {
    profileSaving.value = false;
  }
};

/**
 * 处理重置个人资料
 */
const handleResetProfile = () => {
  loadUserData();
  profileFormRef.value?.clearValidate();
};

/**
 * 处理头像上传
 */
const handleAvatarUpload = async (file: File): Promise<boolean> => {
  // 验证文件类型
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('只能上传图片文件');
    return false;
  }

  // 验证文件大小 (2MB)
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB');
    return false;
  }

  avatarUploading.value = true;
  try {
    const result = await uploadAvatar(file);
    if (result) {
      currentAvatar.value = result.url; // 用于显示
      profileForm.avatarId = result.fileId; // 用于提交给后端
      ElMessage.success('头像上传成功');
    }
  } catch (error) {
    console.error('头像上传失败:', error);
    ElMessage.error('头像上传失败');
  } finally {
    avatarUploading.value = false;
  }

  return false; // 阻止默认上传行为
};

/**
 * 处理修改密码
 */
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return;

  try {
    await passwordFormRef.value.validate();
    
    passwordSaving.value = true;
    
    const success = await changePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword
    );

    if (success) {
      ElMessage.success('密码修改成功');
      handleResetPassword();
    }
  } catch (error) {
    console.error('修改密码失败:', error);
  } finally {
    passwordSaving.value = false;
  }
};

/**
 * 处理重置密码表单
 */
const handleResetPassword = () => {
  passwordForm.currentPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
  passwordFormRef.value?.clearValidate();
};
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
  padding: var(--space-lg);
}

.settings-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--space-xl);
  text-align: center;
}

.page-title {
  margin: 0 0 var(--space-sm) 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.page-description {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text-secondary);
}

.settings-content {
  display: flex;
  gap: var(--space-xl);
  align-items: flex-start;
}

.settings-nav {
  width: 200px;
  flex-shrink: 0;
}

.settings-nav .el-menu {
  border-right: none;
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
}

.settings-panel {
  flex: 1;
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--space-xl);
}

.setting-section {
  max-width: 600px;
}

.section-header {
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.section-header h2 {
  margin: 0 0 var(--space-xs) 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.section-header p {
  margin: 0;
  color: var(--color-text-secondary);
}

.profile-form,
.password-form {
  margin-top: var(--space-lg);
}

.form-tip {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-top: var(--space-xs);
}

.avatar-section {
  display: flex;
  gap: var(--space-xl);
  align-items: flex-start;
}

.current-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--color-border);
}

.avatar-info {
  text-align: center;
}

.avatar-label {
  margin: 0 0 var(--space-xs) 0;
  font-weight: 500;
  color: var(--color-text-primary);
}

.avatar-tip {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.avatar-upload {
  flex: 1;
}

.avatar-uploader {
  margin-bottom: var(--space-md);
}

.upload-tips {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.upload-tips p {
  margin: var(--space-xs) 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-page {
    padding: var(--space-md);
  }

  .settings-content {
    flex-direction: column;
    gap: var(--space-lg);
  }

  .settings-nav {
    width: 100%;
  }

  .settings-nav .el-menu {
    display: flex;
    overflow-x: auto;
  }

  .settings-panel {
    padding: var(--space-lg);
  }

  .avatar-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .settings-panel {
    padding: var(--space-md);
  }

  .avatar-preview {
    width: 100px;
    height: 100px;
  }
}
</style>