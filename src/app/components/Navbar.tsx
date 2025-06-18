import { SignedIn, UserButton, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'

function Navbar(): React.JSX.Element {
    return (
        <>
            <header className='flex justify-between items-center'>
                <div className="flex items-center justify-start p-4 h-16 gap-10">
                    <img className='w-[150px] self-center' src="/logo.svg" alt="Logo" />

                    <div className="hidden md:flex items-center gap-9 ">
                        <Link className="text-white text-sm font-medium leading-normal hover:text-gray-300" href="#">Home</Link>
                        <Link className="text-white text-sm font-medium leading-normal hover:text-gray-300" href="#">Courses</Link>
                        <Link className="text-white text-sm font-medium leading-normal hover:text-gray-300" href="#">Instructors</Link>
                        <Link className="text-white text-sm font-medium leading-normal hover:text-gray-300" href="#">My Learning</Link>
                    </div>

                </div>

                <div className="flex p-4 gap-4">
                    <input
                        placeholder="Search"
                        className="hidden xl:block max-w-xs w-full flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-secondary-600 focus:border-none h-10 placeholder:text-secondary-200 px-4 text-base font-normal leading-normal"
                    // value=""
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="search-icon xl:hidden self-center hover:cursor-pointer" //Optional: add a class for specific styling
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>

                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="px-4 py-2 bg-primary-600 text-primary-foreground rounded-md font-semibold cursor-pointer hover:bg-primary-700 hover:text-white transition-colors">
                                Log In
                            </button>
                        </SignInButton>

                        <SignUpButton mode="modal">
                            <button className="hidden md:block px-4 py-2 bg-secondary-600 text-secondary-foreground rounded-md cursor-pointer text-white hover:bg-secondary-700  transition-colors">
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