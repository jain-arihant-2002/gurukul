'use server';
import { db } from '@/db';
import { usersTable } from '@/db/schema';
import { LmsRole } from '@/utils/ROLE';
import { eq } from 'drizzle-orm';

/**
 * Creates a new user in the Gurukul database.
 * @param userData - The data for the new user.
 * @returns The newly created user object from the database.
 */

export const addUser = async (userData: {
  clerkUserId: string;
  email: string;
  fullName?: string | null;
  lmsRole?: LmsRole;
}) => {
  try {
    const newUser = await db.insert(usersTable).values(userData).returning();
    return [newUser, null];
  } catch (error: any) {

    if (error.cause.code === '23505')
      return [null, new Error('User already exists.')];

    if (error.cause.code === '23502')
      return [null, new Error('User data is incomplete.')];

    // Handle other database errors
    console.error('Error adding user:', error);
    return [null, new Error('An unexpected error occurred while adding user.')];
  }
};


/** * Deletes a user from the Gurukul database.
 * @param clerkUserId - The Clerk user ID of the user to delete.
 * @returns A boolean indicating whether the deletion was successful.
 */
export const deleteUser = async (clerkUserId: string) => {

  try {
    const deletedUser = await db.delete(usersTable).where(eq(usersTable.clerkUserId, clerkUserId)).returning();
    return [deletedUser.length > 0, null];
  } catch (error: any) {
    return [null, new Error('An unexpected error occurred while deleting user.')];
  }
}
/** * Updates an existing user in the database.
 * @param clerkUserId - The Clerk user ID of the user to update.
 * @param userData - The new data for the user.
 * @returns A tuple containing the updated user object or null, and an error object or null.
 */

export const updateUser = async (clerkUserId: string, userData: Partial<{
  email: string;
  fullName: string;
  updatedAt: Date;
}>) => {
  try {
    const updatedUser = await db.update(usersTable)
      .set(userData)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .returning();
    return [updatedUser, null];
  } catch (error: any) {
    console.error('Error updating user:', error);
    return [null, new Error('An unexpected error occurred while updating user.')];
  }
};