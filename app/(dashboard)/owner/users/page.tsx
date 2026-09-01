import { getUsers } from '@/lib/actions/user';
import { getBranches } from '@/lib/actions/branch';
import UsersList from './UsersList';

export default async function UsersPage() {
  const [users, branches] = await Promise.all([
    getUsers(),
    getBranches(),
  ]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <UsersList users={users} branches={branches} />
    </div>
  );
}
