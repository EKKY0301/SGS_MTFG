"use client"

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSessionContext } from '@/services/session/context/context';
import clsx from 'clsx';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const { isSubmitting, error, login, clearError } = useSessionContext();

    useEffect(() => {
        if (!error) {
            return;
        }

        setToastMessage(error);
        clearError();
    }, [clearError, error]);

    useEffect(() => {
        if (!toastMessage) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setToastMessage(null);
        }, 4000);

        return () => window.clearTimeout(timeoutId);
    }, [toastMessage]);

    const isDisabled = useMemo(() => {
        return isSubmitting || username.trim() === '' || password.trim() === '';
    }, [isSubmitting, password, username]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isDisabled) {
            return;
        }

        clearError();
        try {
            await login({ username, password });
        } catch {
            // Session context already stores the user-facing error state.
        }
    };

    return (
        <div className="relative w-full h-full">
            {toastMessage ? (
                <div className="pointer-events-none fixed right-6 top-6 z-50 flex max-w-sm justify-end">
                    <div role="alert" className="pointer-events-auto rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg">
                        <div className="flex items-start gap-3">
                            <p className="flex-1">{toastMessage}</p>
                            <button
                                type="button"
                                className="text-red-500 transition-colors duration-100 hover:text-red-700"
                                onClick={() => setToastMessage(null)}
                                aria-label="Cerrar notificacion"
                            >
                                x
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            <form onSubmit={handleSubmit} className='absolute left-[50%] -translate-x-[50%] top-[50%] -translate-y-[50%] w-[75%] h-[50%] flex flex-col rounded-md border-2 border-border-strong p-10 gap-5 items-center justify-center' aria-label="Formulario de inicio de sesion">
                <h1 className='text-black font-bold text-3xl'> Acceder </h1>
                <div className='flex flex-col text-black/50 font-bold w-full'>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        aria-autocomplete='none'
                        className='p-2 outline-none bg-transparent border-b-2 border-black/60'
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        autoComplete="username"
                    />
                </div>

                <div className='flex flex-col text-black/50 font-bold w-full'>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        className='p-2 outline-none bg-transparent border-b-2 border-black/60'
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                    />
                </div>

                <button type="submit" className={clsx(isDisabled && 'cursor-not-allowed brightness-75', !isDisabled && 'cursor-pointer transition-all duration-100 hover:brightness-105', 'bg-blue-300 text-black w-[50%] rounded-md p-2')} disabled={isDisabled}>
                    Acceder
                </button>
            </form>
        </div>
    );
}

