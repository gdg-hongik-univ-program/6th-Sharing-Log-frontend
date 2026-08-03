export const getAssignee = (task, weekIndex) => {
  // 실제 데이터 구조인 eligibility.members 배열을 참조하도록 변경
  const members = task.eligibility?.members;

  // 방어 코드
  if (!members || members.length === 0) {
    return null;
  }

  const totalMembers = members.length;
  const targetIndex = weekIndex % totalMembers;

  return members[targetIndex];
};
