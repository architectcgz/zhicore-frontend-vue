import { computed, type Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { rankingApi, type RankingQueryParams } from '@/api/ranking';
import { userApi, type PublicUserSummary } from '@/api/user';
import { queryKeys } from '../query-keys';

type HotCreatorUsersParams = Pick<RankingQueryParams, 'page' | 'size'>;

export function useHotCreatorUsersQuery(
  params?: Ref<HotCreatorUsersParams> | HotCreatorUsersParams
) {
  const queryParams = computed(() => {
    if (!params) {
      return undefined;
    }

    return typeof params === 'object' && 'value' in params ? params.value : params;
  });

  return useQuery<PublicUserSummary[]>({
    queryKey: computed(() => queryKeys.users.hotCreators(queryParams.value)),
    queryFn: async () => {
      const creatorIds = await rankingApi.getHotCreatorIds({
        page: queryParams.value?.page ?? 0,
        size: queryParams.value?.size ?? 4,
      });

      if (creatorIds.length === 0) {
        return [];
      }

      const uniqueCreatorIds = [...new Set(creatorIds.filter(Boolean))];
      const userResults = await Promise.allSettled(
        uniqueCreatorIds.map((creatorId) => userApi.getPublicUserSummary(creatorId))
      );

      return userResults.flatMap((result) => {
        if (result.status === 'fulfilled') {
          return [result.value];
        }

        return [];
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}
