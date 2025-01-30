'use client';

import React, { useEffect, useState } from 'react';
import { checkUser, checkUserRole } from '@/lib/auth';

interface UserRoleFetcherProps {
  student: React.ReactNode;
  teacher: React.ReactNode;
  children: React.ReactNode;
}

const UserRoleFetcher: React.FC<UserRoleFetcherProps> = ({ student, teacher, children }) => {
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; user_role: string } | null>(null);

  useEffect(() => {
    const fetchUserAndRole = async () => {
      const user = await checkUser();
      setUser(user);

      if (user) {
        const userRole = await checkUserRole();
        setRole(userRole);
      }
    };
    fetchUserAndRole();
  }, []);

  if (!user) {
    return <>{children}</>; // Si l'utilisateur n'est pas authentifié, on rend children.
  }
  return role === 'TEACHER' ? teacher : student; // Si l'utilisateur a un rôle, on affiche le rôle correspondant.
};

export default UserRoleFetcher;