"use client";

import { Spinner } from "@heroui/react";
import { AdminLayout } from "../../components/admin-layout";
import type { User } from "../lib/user-actions";
import { AdminUsersList } from "./admin-users-list";
import { PendingUsersList } from "./pending-users-list";

type UsersContentProps = {
  isLoading: boolean;
  error: string | null;
  pendingUsers: User[];
  adminUsers: User[];
  processingUserId: string | null;
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
};

export const UsersContent = ({
  isLoading,
  error,
  pendingUsers,
  adminUsers,
  processingUserId,
  onApprove,
  onReject,
}: UsersContentProps) => {
  return (
    <AdminLayout title="User Management">
      {error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Pending Approvals ({pendingUsers.length})
              </h2>
            </div>
            <PendingUsersList
              users={pendingUsers}
              processingUserId={processingUserId}
              onApprove={onApprove}
              onReject={onReject}
            />
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Administrators ({adminUsers.length})
              </h2>
            </div>
            <AdminUsersList users={adminUsers} />
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
