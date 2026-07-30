export const mockChores = [
  {
    choreId: "chore-001",
    groupId: "group-001",
    name: "쓰레기통 비우기",
    schedule: {
      frequency: "DAILY", // 매일
      dueTime: "18:00",
      weeklyDueDay: null,
      biweeklyAnchorDate: null,
    },
    eligibility: {
      mode: "ALL_ACTIVE_MEMBERS",
      members: [
        {
          membershipId: "mem-001",
          displayName: "김철수",
          avatarUrl: "https://example.com/avatar1.png",
          status: "ACTIVE",
        },
        {
          membershipId: "mem-002",
          displayName: "이영희",
          avatarUrl: "https://example.com/avatar2.png",
          status: "ACTIVE",
        },
      ],
    },
    active: true,
    createdByMembershipId: "mem-001",
    createdAt: "2026-07-30T18:22:16.639Z",
    version: 0, // 수정 시 업데이트되는 버전 정보
  },
  {
    choreId: "chore-002",
    groupId: "group-001",
    name: "화장실 청소",
    schedule: {
      frequency: "WEEKLY", // 매주
      dueTime: "17:00",
      weeklyDueDay: "FRIDAY",
      biweeklyAnchorDate: null,
    },
    eligibility: {
      mode: "SPECIFIC_MEMBERS",
      members: [
        {
          membershipId: "mem-003",
          displayName: "박지성",
          avatarUrl: "https://example.com/avatar3.png",
          status: "ACTIVE",
        },
      ],
    },
    active: true,
    createdByMembershipId: "mem-003",
    createdAt: "2026-07-31T09:00:00.000Z",
    version: 1,
  },
];
