import { http, HttpResponse } from "msw";
import { mockChores } from '../choreData';

let currentChores = [...mockChores];



export const choreHandler = [
  
  // [GET] 업무 목록 조회 API

  http.get("/api/groups/:groupId/chores", ({ params }) => {
    const { groupId } = params;
    const groupChores = currentChores.filter((chore) => chore.groupId === groupId);

    return HttpResponse.json({
      items: groupChores,
      nextCursor: null,
      hasNext: false,
    });
  }),

 
  // [POST] 새 업무 추가 API
  
  http.post("/api/groups/:groupId/chores", async ({ params, request }) => {
    const { groupId } = params;
    const requestBody = await request.json();

    // 새 업무 객체 만들기
    const newChore = {
      choreId: `chore-${Date.now()}`, // 겹치지 않게 현재 시간으로 임시 ID 생성
      groupId: groupId,
      name: requestBody.name, // 프론트가 보낸 이름
      schedule: requestBody.schedule, // 프론트가 보낸 일정
      active: true,
      createdAt: new Date().toISOString(),
    };

    
    currentChores.push(newChore);

    return HttpResponse.json(
      {
        chore: newChore,
        currentOccurrence: {
          occurrenceId: `occ-${Date.now()}`,
          choreId: newChore.choreId,
          choreName: newChore.name,
          status: "ASSIGNED", // 할당 상태
        },
      },
      { status: 201 }
    );
  }), 

 
  // [PATCH] 업무 수정 API
  // 주소: /api/groups/{groupId}/chores/{choreId}
 
  http.patch("/api/groups/:groupId/chores/:choreId", async ({ params, request }) => {
    const { groupId, choreId } = params;
    const requestBody = await request.json(); // 프론트엔드가 보낸 수정할 데이터

    // 수정할 대상 찾기
    const targetIndex = currentChores.findIndex(
      (chore) => chore.groupId === groupId && chore.choreId === choreId
    );

    // 404 에러
    if (targetIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    // 기존 데이터에 새로운 데이터 덮어쓰기 (수정)
    currentChores[targetIndex] = {
      ...currentChores[targetIndex],
      name: requestBody.name || currentChores[targetIndex].name,
      schedule: requestBody.schedule || currentChores[targetIndex].schedule,
      version: (currentChores[targetIndex].version || 0) + 1,
    };

    // 성공적으로 수정된 최신 데이터를 반환 (200 OK)
    return HttpResponse.json(currentChores[targetIndex], { status: 200 });
  }), 


  // [DELETE] 업무 삭제 API
  // 주소: /api/groups/{groupId}/chores/{choreId}

  http.delete("/api/groups/:groupId/chores/:choreId", ({ params }) => {
    const { groupId, choreId } = params;

    // 가짜 데이터에서 삭제할 대상 찾기
    const targetIndex = currentChores.findIndex(
      (chore) => chore.groupId === groupId && chore.choreId === choreId
    );

    // 404 에러
    if (targetIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    // 배열에서 해당 아이템 완전히 제거
    currentChores.splice(targetIndex, 1);

    // 성공 시 데이터 없이 상태 코드만 200 반환 (API 명세서 기준)
    return new HttpResponse(null, { status: 200 });
  }) 
];