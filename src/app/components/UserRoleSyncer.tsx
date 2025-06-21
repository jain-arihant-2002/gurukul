'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import useUserStore from '@/_store/Store'; // Zustand or your context

export default function UserRoleSyncer() {
    const { userId } = useAuth();
    const setRole = useUserStore((s) => s.setRole);


    useEffect(() => {
        if (!userId) {
            setRole(null);
            return;
        }

        async function fetchRole() {
            try {
                const res = await fetch('/api/user/role');
                const data = await res.json();
                if (data.role) setRole(data.role);
                else setRole(null);
            } catch {
                setRole(null);
            }
        }
        fetchRole();
    }, [userId, setRole]);

    return null; // This component doesn't render anything
}