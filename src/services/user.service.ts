'use server';
import { db } from '@/db';
import { usersTable } from '@/db/schema';
import { LmsRole, User, UserData, ServiceError } from '@/utils/types';
import { eq } from 'drizzle-orm';

/**
 * Creates a new user in the Gurukul database.
 * @param userData - The data for the new user.
 * @returns The newly created user object from the database.
 */


export const addUser = async (userData: UserData): Promise<[User[] | null, ServiceError | null]> => {
  try {
    const newUser = await db.insert(usersTable).values(userData).returning();
    return [newUser, null];
  } catch (error: any) {

    if (error.cause.code === '23505')
      return [null, { message: 'User already exists.', error }];

    if (error.cause.code === '23502')
      return [null, { message: 'User data is incomplete.', error }];

    // Handle other database errors
    return [null, { message: 'An unexpected error occurred while adding user.', error }];
  }
};


/** * Deletes a user from the Gurukul database.
 * @param clerkUserId - The Clerk user ID of the user to delete.
 * @returns A boolean indicating whether the deletion was successful.
 */
export const deleteUser = async (clerkUserId: string): Promise<[boolean | null, ServiceError | null]> => {
  // Here we are only removing the user from the database, not all the related data.
  try {
    const deletedUser = await db.delete(usersTable).where(eq(usersTable.clerkUserId, clerkUserId)).returning();
    return [deletedUser.length > 0, null];
  } catch (error: any) {
    return [null, { message: 'An unexpected error occurred while deleting user.', error }];
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
}>): Promise<[User[] | null, ServiceError | null]> => {
  try {
    const updatedUser = await db.update(usersTable)
      .set(userData)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .returning();
    return [updatedUser, null];
  } catch (error: any) {
    return [null, { message: 'An unexpected error occurred while updating user.', error }];
  }
};

export const getUserByClerkId = async (clerkUserId: string) => {
  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkUserId, clerkUserId)).limit(1);
    if (user.length === 0) {
      return [null, { message: 'User not found', error: null }];
    }
    return [user[0], null];
  } catch (error: any) {
    return [null, { message: 'An unexpected error occurred while fetching user by Clerk ID.', error }];
  }
};

export const getAllUsers = async () => {
  try {
    const users = await db.select().from(usersTable);
    return [users, null];
  } catch (error: any) {
    return [null, { message: 'An unexpected error occurred while fetching all users.', error }];
  }
};

export const getUsersByRole = async (role: LmsRole) => {
  try {
    const users = await db.select().from(usersTable).where(eq(usersTable.lmsRole, role));
    return [users, null];
  } catch (error: any) {
    return [null, { message: 'An unexpected error occurred while fetching users by role.', error }];
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (user.length === 0)
      return [null, { message: 'User not found', error: null }];

    return [user[0], null];
  } catch (error: any) {
    return [null, { message: 'An unexpected error occurred while fetching user by email.', error }];
  }
};
