// src/components/UserRoleFetcher.tsx
'use client';  

import React, { useEffect, useState } from 'react';
import { checkUserRole } from '@/lib/auth';

interface UserRoleFetcherProps {
  student: React.ReactNode;
  teacher: React.ReactNode;
}

const UserRoleFetcher: React.FC<UserRoleFetcherProps> = ({ student, teacher}) => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const userRole = await checkUserRole();
      setRole(userRole);
    };
    fetchRole();
  }, []);  

  if (role === null) {
    return <p>Loading...</p>;
  }
  
  return role === 'TEACHER' ? teacher : student;
};

export default UserRoleFetcher;