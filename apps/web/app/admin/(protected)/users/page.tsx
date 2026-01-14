import { UsersPageClient } from "./components/users-page-client";
import { loadUsers } from "./lib/user-actions";

const UsersPage = async () => {
  const { users, error } = await loadUsers();

  return <UsersPageClient initialUsers={users} initialError={error} />;
};

export default UsersPage;
