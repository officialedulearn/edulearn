// File: /actions/user-xp.ts
"use server"

import { getUserXP, updateUserXP, getAllUsersAndXP } from "@/lib/db/queries"
import { getUser } from "./login"

export async function getCurrentUserAndXP() {
    const user = await getUser()
    if (!user?.sub) return { userId: null, currentXP: 0 }
    
    const userId = user.sub as string
    const currentXP = await getUserXP(userId) || 0
    
    return { userId, currentXP }
  }

export async function updateUserXPAction(userId: string, newXP: number): Promise<number> {
  try {
    // Get current XP
    const currentXP = await getUserXP(userId) || 0
    
    // Update XP in database
    await updateUserXP(userId, newXP)
    return currentXP + newXP
  } catch (error) {
    console.error("Error updating user XP:", error)
    return 0
  }
}
export async function getAllUsersAndXPAction() {
    try {
        const users = await getAllUsersAndXP()
        return users;
    } catch (error) {
        console.error("Failed to get all users from database")
        throw error
        
    }
}