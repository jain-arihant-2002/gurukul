import { SignedIn, UserButton, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'
import React from 'react'

function Navbar(): React.JSX.Element {
    return (
        <>
            <header className="flex justify-end items-center p-4 gap-4 h-16">
                <SignedOut>
                    <SignInButton />
                    {/* <SignUpButton /> */}
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </header>
        </>
    )
}

export default Navbar