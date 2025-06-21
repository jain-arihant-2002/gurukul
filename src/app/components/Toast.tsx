'use client';
import { useEffect, useState } from 'react';

export default function Toast({ message, type, isVisible }: { message: string; type: string; isVisible: boolean }): React.JSX.Element | null {

    const [render, setRender] = useState(false);

    useEffect(() => {

        if (isVisible) {
            const trueTimer = setTimeout(() => {
                setRender(true);
            }, 100); // Show after 0.1 second

            const falseTimer = setTimeout(() => {
                setRender(false);
            }, 2000); // Hide after 2 seconds

            return () => {
                clearTimeout(trueTimer);
                clearTimeout(falseTimer);
            };
        } else {
            setRender(false);
        }
    }, [isVisible]);


    if (!isVisible && !render) return null;

    return (
        <div
            className={`fixed z-50 top-4 right-4 p-4 rounded shadow-md ${type === 'success' ? 'bg-green-500' : 'bg-red-500'
                } text-white transition-opacity duration-1000 ease-in-out ${render ? 'opacity-100' : 'opacity-0'
                }`}
        >
            {message}
        </div>
    );
}