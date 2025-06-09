
import { useState, useEffect } from 'react';

const ADMIN_USERS = ['admin', 'administrator']; // Add your admin username here

export const useAdminAccess = (currentUser: string | null) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const adminStatus = ADMIN_USERS.includes(currentUser.toLowerCase());
      setIsAdmin(adminStatus);
    } else {
      setIsAdmin(false);
    }
  }, [currentUser]);

  return { isAdmin };
};
