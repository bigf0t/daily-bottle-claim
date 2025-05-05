
import { User } from "@/types/auth";

/**
 * Maps database user object (snake_case) to our application User type (camelCase)
 */
export const mapDatabaseUserToAppUser = (dbUser: any): User => {
  return {
    id: dbUser.id,
    username: dbUser.username,
    totalClaims: dbUser.total_claims || 0,
    streak: dbUser.streak || 0,
    lastClaim: dbUser.last_claim || null,
    isAdmin: dbUser.is_admin || false,
    createdAt: dbUser.created_at,
    usernameUpdatedAt: dbUser.username_updated_at,
    ethAddress: dbUser.eth_address,
    email: dbUser.email,
    profilePicture: dbUser.profile_picture
  };
};

/**
 * Maps application User type (camelCase) to database format (snake_case)
 */
export const mapAppUserToDatabaseUser = (appUser: Partial<User>): any => {
  const dbUser: any = {};
  
  if (appUser.id !== undefined) dbUser.id = appUser.id;
  if (appUser.username !== undefined) dbUser.username = appUser.username;
  if (appUser.totalClaims !== undefined) dbUser.total_claims = appUser.totalClaims;
  if (appUser.streak !== undefined) dbUser.streak = appUser.streak;
  if (appUser.lastClaim !== undefined) dbUser.last_claim = appUser.lastClaim;
  if (appUser.isAdmin !== undefined) dbUser.is_admin = appUser.isAdmin;
  if (appUser.createdAt !== undefined) dbUser.created_at = appUser.createdAt;
  if (appUser.usernameUpdatedAt !== undefined) dbUser.username_updated_at = appUser.usernameUpdatedAt;
  if (appUser.ethAddress !== undefined) dbUser.eth_address = appUser.ethAddress;
  if (appUser.email !== undefined) dbUser.email = appUser.email;
  if (appUser.profilePicture !== undefined) dbUser.profile_picture = appUser.profilePicture;
  
  return dbUser;
};
