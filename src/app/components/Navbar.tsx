import { PrimaryButton, SecondaryButton } from '@/utils/commonClasses'
import { SignedIn, UserButton, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'
import { Search } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function Navbar(): React.JSX.Element {

    return (
        <>
            <header className='flex justify-between items-center bg-background border-primary-950 border-b-2 text-white sticky top-0 z-50'>
                <div className="flex items-center justify-start p-4 h-16 gap-10">
                    <Link href='/'>
                        <img className='w-[150px] self-center' src="/logo.svg" alt="Logo" />
                    </Link>

                    <div className="hidden md:flex items-center gap-9 ">
                        <Link className="text-white text-sm font-medium leading-normal hover:text-gray-300" href="/courses">Courses</Link>
                        <Link className="text-white text-sm font-medium leading-normal hover:text-gray-300" href="/instructors">Instructors</Link>
                        <Link className="text-white text-sm font-medium leading-normal hover:text-gray-300" href="/contact-us">Contact Us</Link>
                        <Link className="text-white text-sm font-medium leading-normal hover:text-gray-300" href="/teach-with-us">Teach With Us</Link>
                    </div>

                </div>

                <div className="flex p-4 gap-4">
                    <input
                        placeholder="Search"
                        className="hidden xl:block max-w-xs w-full flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-secondary-600 focus:border-none h-10 placeholder:text-secondary-200 px-4 text-base font-normal leading-normal"
                    // value=""
                    />
                    <div className="search-icon xl:hidden self-center hover:cursor-pointer" //Optional: add a class for specific styling
                    >
                        <Search />

                    </div>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className={PrimaryButton}>
                                Log In
                            </button>
                        </SignInButton>

                        <SignUpButton mode="modal">
                            <button className={SecondaryButton}>
                                Sign Up
                            </button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </div>
            </header>
        </>
    )

}

export default Navbar