"use client"

import { SignUp, useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Page() {
    const router = useRouter()
    const { getToken } = useAuth()

    useEffect(() => {
        const checkAuth = async () => {
            const token = await getToken()
            if (token) router.push("/dashboard")
        }

        checkAuth()
    }, [getToken, router]) 

    return (
        <div className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2">
            <SignUp />
        </div>
    )
}
