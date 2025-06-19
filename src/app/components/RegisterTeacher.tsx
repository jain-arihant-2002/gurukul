import Link from "next/link";

export default function RegisterTeacher() {

    return (
        <Link href="/register-teacher">
            <button className='px-4 py-2 bg-primary-600 text-primary-foreground rounded-md font-semibold cursor-pointer hover:bg-primary-700 hover:text-white transition-colors'>
                Register as Teacher
            </button>
        </Link>
    );
}