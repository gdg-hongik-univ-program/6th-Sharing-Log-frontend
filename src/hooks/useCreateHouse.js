import { useState } from "react";
import { useNavigate } from "react-router";

import { getCsrfToken } from "../api/authApi";
import { createGroup } from "../api/groupApi";
import { createInvitation } from "../api/invitationApi";
import { saveActiveGroupId } from "../utils/activeGroup";

export default function useCreateHouse() {
  const navigate = useNavigate();

  const [houseName, setHouseName] =
    useState("");

  const [address, setAddress] =
    useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const csrf = await getCsrfToken();

    // 새로운 하우스를 생성합니다.
    const group = await createGroup({
      name: houseName.trim(),
      address: address.trim() || null,
      csrf,
    });

    // 방금 생성한 하우스를 현재 하우스로 저장합니다.
    saveActiveGroupId(
      group.groupPublicId,
    );

    // 생성된 하우스의 초대 코드를 발급합니다.
    const invitation =
      await createInvitation({
        groupId: group.groupId,
        csrf,
      });

    navigate("/invite-house", {
      state: {
        houseName: group.name,
        groupId: group.groupId,
        groupPublicId:
          group.groupPublicId,
        inviteCode: invitation.code,
        expiresAt:
          invitation.expiresAt,
      },
    });
  }

  return {
    houseName,
    setHouseName,
    address,
    setAddress,
    handleSubmit,
  };
}
