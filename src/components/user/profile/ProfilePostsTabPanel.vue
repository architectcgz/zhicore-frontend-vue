<script setup lang="ts">
import PostCard from '@/components/post/PostCard.vue';
import ProfileCollectionPanelShell from '@/components/user/profile/ProfileCollectionPanelShell.vue';
import type { Post } from '@/types';
import type {
  ProfileCollectionState,
  ProfileFavoriteChange,
  ProfileLikeChange,
} from '@/types/user/profile';

interface Props {
  state: ProfileCollectionState<Post>;
  loadingText: string;
  errorTitle: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon: string;
  showCreateAction?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showCreateAction: false,
});

const emit = defineEmits<{
  retry: [];
  'load-more': [];
  'create-post': [];
  'like-change': [change: ProfileLikeChange];
  'favorite-change': [change: ProfileFavoriteChange];
}>();
</script>

<template>
  <ProfileCollectionPanelShell
    :loading="props.state.loading"
    :error="props.state.error"
    :list-length="props.state.list.length"
    :has-more="props.state.hasMore"
    :loading-more="props.state.loadingMore"
    :loading-text="props.loadingText"
    :error-title="props.errorTitle"
    :empty-title="props.emptyTitle"
    :empty-description="props.emptyDescription"
    :empty-icon="props.emptyIcon"
    @retry="emit('retry')"
    @load-more="emit('load-more')"
  >
    <template #empty-actions>
      <el-button
        v-if="props.showCreateAction"
        type="primary"
        @click="emit('create-post')"
      >
        写文章
      </el-button>
    </template>

    <div class="posts-grid">
      <PostCard
        v-for="post in props.state.list"
        :key="post.id"
        :post="post"
        @like-change="emit('like-change', $event)"
        @favorite-change="emit('favorite-change', $event)"
      />
    </div>
  </ProfileCollectionPanelShell>
</template>

<style scoped>
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
}
</style>
