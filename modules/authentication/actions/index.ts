"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export const currentUser = async() => {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session){
            return null
        }

        const user = await prisma.user.findUnique({
        where: {
            id: session.user.id,
        },
        select: {
            id: true,
            email: true,
            name: true,
            image: true,
            createdAt: true,
            updatedAt: true,
        },
        });

        return user
    } catch (error) {
        console.error("Error fetching current user:", error);
        return null
    }
}

export const requireAuth = async() => {
    let session = null

    try {
        session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session){
            return redirect("/sign-in")
        }

        return session
    } catch (error) {
        console.error("Error fetching current session:", error);
        return null
    }
}

export const requireUnAuth = async() => {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (session){
            return redirect("/")
        }

        return null
    } catch (error) {
        console.error("Error fetching current session:", error);
        return null
    }
}