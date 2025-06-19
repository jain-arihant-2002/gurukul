// src/middleware/roleAuth.ts
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/services/user.service';

export async function isAuthorized(
  allowedRoles: ('STUDENT' | 'INSTRUCTOR' | 'ADMIN')[]
) {
  const { userId } = await auth();

  // Not authenticated
  if (!userId) {
    return false;
  }

  // Get user from database
  const [user, error] = await getUserByClerkId(userId);

  if (error || !user || user instanceof Error) {
    return false;
  }

  // Check if user has required role
  if (!allowedRoles.includes(user.lmsRole)) {
    return false;
  }

  // User has the required role, return null to indicate no error
  return true;
}