"use client";

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

type AdminUsersListProps = {
  users: User[];
};

export const AdminUsersList = ({ users }: AdminUsersListProps) => {
  if (users.length === 0) {
    return <p className="text-gray-500">No administrators</p>;
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
        >
          <div>
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-xs text-gray-500">
              Registered: {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            Admin
          </div>
        </div>
      ))}
    </div>
  );
};
