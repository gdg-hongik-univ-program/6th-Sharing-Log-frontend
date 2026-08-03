import { http, HttpResponse } from "msw";
import { mockMembers } from "../memberData"; // 실제 멤버 데이터 파일 경로에 맞게 수정해주세요

export const memberHandler = [
  // ----------------------------------------------------
  // [GET] 그룹 멤버 목록 조회 API
  // 주소: /api/groups/{groupId}/members
  // ----------------------------------------------------
  http.get("/api/groups/:groupId/members", ({ params }) => {
    const { groupId } = params;

    // 1️⃣ 전체 멤버 목데이터에서 현재 요청한 그룹(groupId)에 속한 사람만 찾아냅니다.
    const groupMembers = mockMembers.filter(
      (member) => member.groupId === groupId,
    );

    return HttpResponse.json({
      items: groupMembers,
    });
  }),
];
