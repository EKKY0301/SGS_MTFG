"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import Login from "@/components/Login";
import { useSessionContext } from "@/services/session/context/context";

function LoginContent() {
    const { isAuthenticated } = useSessionContext();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/nikkai/home");
        }
    }, [isAuthenticated, router]);

    return (
        <Login />
    );
}

export default function LoginPage() {
    return (
        <div className="w-screen h-screen flex flex-row">
            <div className="w-[60vw]"></div>
            <div className="flex-1 bg-background-dark p-10">
                <Suspense fallback={<Login />}>
                    <LoginContent />
                </Suspense>
            </div>
        </div>
    );
}
