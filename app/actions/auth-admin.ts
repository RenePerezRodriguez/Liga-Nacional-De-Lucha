"use server";

import { initAdmin } from "@/lib/firebase-admin";

// Define User Interface
export interface AdminUser {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    disabled: boolean;
    metadata: {
        creationTime: string;
        lastSignInTime: string;
    };
    customClaims?: { [key: string]: unknown };
}

interface ListUsersResponse {
    users: AdminUser[];
    pageToken?: string;
}

// Function to verify if the requester is an admin (Optional but recommended)
// requires passing idToken from client

export async function listUsersAction(pageToken?: string, limit: number = 20): Promise<{ success: boolean; data?: ListUsersResponse; error?: string }> {
    try {
        const admin = await initAdmin();
        const listUsersResult = await admin.auth().listUsers(limit, pageToken);

        const users: AdminUser[] = listUsersResult.users.map((userRecord) => ({
            uid: userRecord.uid,
            email: userRecord.email || "",
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL,
            disabled: userRecord.disabled,
            metadata: {
                creationTime: userRecord.metadata.creationTime,
                lastSignInTime: userRecord.metadata.lastSignInTime,
            },
            customClaims: userRecord.customClaims,
        }));

        return {
            success: true,
            data: {
                users,
                pageToken: listUsersResult.pageToken,
            },
        };
    } catch (error: unknown) {
        console.error("Error listing users:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function updateUserClaimsAction(uid: string, claims: { [key: string]: unknown }) {
    try {
        const admin = await initAdmin();
        await admin.auth().setCustomUserClaims(uid, claims);
        return { success: true };
    } catch (error: unknown) {
        console.error("Error setting custom claims:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function updateUserAction(uid: string, data: { displayName?: string; password?: string; disabled?: boolean }) {
    try {
        const admin = await initAdmin();
        await admin.auth().updateUser(uid, data);
        return { success: true };
    } catch (error: unknown) {
        console.error("Error updating user:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteUserAction(uid: string) {
    try {
        const admin = await initAdmin();
        await admin.auth().deleteUser(uid);
        return { success: true };
    } catch (error: unknown) {
        console.error("Error deleting user:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function createUserAction(data: { email: string; password?: string; displayName?: string; role?: string }) {
    try {
        const admin = await initAdmin();

        // 1. Create User
        const userRecord = await admin.auth().createUser({
            email: data.email,
            password: data.password, // Password is required for creation typically, or email link
            displayName: data.displayName,
        });

        // 2. Set Role if provided
        if (data.role) {
            await admin.auth().setCustomUserClaims(userRecord.uid, { role: data.role });
        }

        return { success: true, uid: userRecord.uid };
    } catch (error: unknown) {
        console.error("Error creating user:", error);
        return { success: false, error: (error as Error).message };
    }
}
