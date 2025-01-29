// src/app/dashboard/layout.tsx
import UserRoleFetcher from '@/components/UserRoleFetcher';

export default function DashBoardLayout({
  student,
  teacher,
  children,
}: {
  teacher: React.ReactNode;
  student: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <UserRoleFetcher student={student} teacher={teacher} />
  );
}