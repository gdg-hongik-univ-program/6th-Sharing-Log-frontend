import { http, HttpResponse } from "msw";
import { mockChores } from "../choreData";
import { mockMembers } from "../memberData";
import { mockRotations } from "../rotationData";

// 메모리 상에서 동적으로 변경될 데이터베이스(배열)
let currentChores = [...mockChores];
let currentRotations = [...mockRotations];

export const choreHandler = [
  // ----------------------------------------------------
  // [GET] 업무 목록 및 로테이션 정보 함께 조회 API
  // ----------------------------------------------------
  http.get("/api/groups/:groupId/chores", ({ params }) => {
    const { groupId } = params;

    const groupChores = currentChores
      .filter((chore) => chore.groupId === groupId)
      .map((chore) => {
        // 해당 chore에 속한 rotation 정보 추출 후 order 순 정렬
        const choreRotations = currentRotations
          .filter((rot) => rot.choreId === chore.choreId)
          .sort((a, b) => a.order - b.order);

        // memberId를 바탕으로 실제 멤버 정보(이름, 색상 등) 조인(JOIN)
        const rotationMembers = choreRotations.map((rot) => {
          const member = mockMembers.find((m) => m.memberId === rot.memberId);
          return {
            memberId: rot.memberId,
            order: rot.order,
            name: member?.name || "알 수 없음",
            color: member?.color || "bg-gray-400",
          };
        });

        return {
          ...chore,
          rotationMembers, // 조인된 로테이션 멤버 목록 포함
          rotationCount: rotationMembers.length,
        };
      });

    return HttpResponse.json({
      items: groupChores,
      nextCursor: null,
      hasNext: false,
    });
  }),

  // ----------------------------------------------------
  // [POST] 새 업무 및 로테이션 멤버 생성 API
  // ----------------------------------------------------
  http.post("/api/groups/:groupId/chores", async ({ params, request }) => {
    const { groupId } = params;
    const requestBody = await request.json();
    // requestBody 구조예시: { name: '...', schedule: {...}, memberIds: ['member-1', 'member-2'] }

    const newChoreId = `chore-${Date.now()}`;

    // 1️⃣ 새 업무(Chore) 생성
    const newChore = {
      choreId: newChoreId,
      groupId: groupId,
      name: requestBody.name,
      schedule: requestBody.schedule,
      active: true,
      createdAt: new Date().toISOString(),
    };
    currentChores.push(newChore);

    // 2️⃣ 전달된 memberIds 기반으로 로테이션 매핑(Rotation) 데이터 생성
    const memberIds = requestBody.memberIds || [];
    const newRotations = memberIds.map((memberId, index) => ({
      rotationId: `rot-${Date.now()}-${index}`,
      choreId: newChoreId,
      memberId: memberId,
      order: index + 1, // 순서 지정 (1부터 시작)
    }));
    currentRotations.push(...newRotations);

    return HttpResponse.json(
      {
        chore: newChore,
        rotations: newRotations,
        currentOccurrence: {
          occurrenceId: `occ-${Date.now()}`,
          choreId: newChoreId,
          choreName: newChore.name,
          assignedMemberId: memberIds[0] || null, // 1번 순서 멤버를 첫 담당자로 지정
          status: "ASSIGNED",
        },
      },
      { status: 201 },
    );
  }),

  // ----------------------------------------------------
  // [PATCH] 업무 및 로테이션 정보 수정 API
  // ----------------------------------------------------
  http.patch(
    "/api/groups/:groupId/chores/:choreId",
    async ({ params, request }) => {
      const { groupId, choreId } = params;
      const requestBody = await request.json();

      const targetIndex = currentChores.findIndex(
        (chore) => chore.groupId === groupId && chore.choreId === choreId,
      );

      if (targetIndex === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      // 1️⃣ 업무 정보 업데이트
      currentChores[targetIndex] = {
        ...currentChores[targetIndex],
        name: requestBody.name || currentChores[targetIndex].name,
        schedule: requestBody.schedule || currentChores[targetIndex].schedule,
        version: (currentChores[targetIndex].version || 0) + 1,
      };

      // 2️⃣ memberIds가 전달된 경우 기존 로테이션 삭제 후 새로 교체 (CASCADE UPDATE 흉내)
      if (requestBody.memberIds) {
        currentRotations = currentRotations.filter(
          (rot) => rot.choreId !== choreId,
        );

        const updatedRotations = requestBody.memberIds.map(
          (memberId, index) => ({
            rotationId: `rot-${Date.now()}-${index}`,
            choreId: choreId,
            memberId: memberId,
            order: index + 1,
          }),
        );

        currentRotations.push(...updatedRotations);
      }

      return HttpResponse.json(currentChores[targetIndex], { status: 200 });
    },
  ),

  // ----------------------------------------------------
  // [DELETE] 업무 및 연관 로테이션 삭제 API
  // ----------------------------------------------------
  http.delete("/api/groups/:groupId/chores/:choreId", ({ params }) => {
    const { groupId, choreId } = params;

    const targetIndex = currentChores.findIndex(
      (chore) => chore.groupId === groupId && chore.choreId === choreId,
    );

    if (targetIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    // 1️⃣ 업무 삭제
    currentChores.splice(targetIndex, 1);

    // 2️⃣ 해당 업무와 연결된 로테이션 매핑 데이터도 함께 삭제 (CASCADE DELETE 흉내)
    currentRotations = currentRotations.filter(
      (rot) => rot.choreId !== choreId,
    );

    return new HttpResponse(null, { status: 200 });
  }),
];
