import { readonly, ref } from "vue";

import { contentDetailResponseMock } from "../config/contentDetailResponseMock";
import { mapContentDetailResponse } from "../lib/contentDetailResponseMapper";

const contentDetail = mapContentDetailResponse(contentDetailResponseMock);

export function useContentDetailPage() {
  const activeCommentSort = ref(contentDetail.commentSortTabs[0] ?? "");
  const commentDraftBody = ref(contentDetail.commentDraftInitialBody);

  function selectCommentSort(sort: string): void {
    if (!contentDetail.commentSortTabs.includes(sort)) {
      return;
    }

    activeCommentSort.value = sort;
  }

  function updateCommentDraftBody(nextBody: string): void {
    commentDraftBody.value = nextBody;
  }

  return {
    detail: contentDetail,
    activeCommentSort: readonly(activeCommentSort),
    commentDraftBody: readonly(commentDraftBody),
    selectCommentSort,
    updateCommentDraftBody,
  };
}
