"use client";

import { useState } from "react";
import { approveUser, rejectUser, type User } from "../lib/user-actions";
import { UsersContent } from "./users-content";

type UsersPageClientProps = {
  initialUsers: User[];
  initialError: string | null;
};

export const UsersPageClient = ({
  initialUsers,
  initialError,
}: UsersPageClientProps) => {
  const [error, setError] = useState<string | null>(initialError);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);

  const handleApprove = async (userId: string) => {
    setProcessingUserId(userId);
    setError(null);

    const err = await approveUser(userId);
    if (err) {
      setError(err);
      setProcessingUserId(null);
      return;
    }

    setProcessingUserId(null);
  };

  const handleReject = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to reject this user? This will delete their account."
      )
    ) {
      return;
    }

    setProcessingUserId(userId);
    setError(null);

    const err = await rejectUser(userId);
    if (err) {
      setError(err);
      setProcessingUserId(null);
      return;
    }

    setProcessingUserId(null);
  };

  const pendingUsers = initialUsers.filter((u) => u.role === "pending");
  const adminUsers = initialUsers.filter((u) => u.role === "admin");

  return (
    <UsersContent
      isLoading={false}
      error={error}
      pendingUsers={pendingUsers}
      adminUsers={adminUsers}
      processingUserId={processingUserId}
      onApprove={handleApprove}
      onReject={handleReject}
    />
  );
};
