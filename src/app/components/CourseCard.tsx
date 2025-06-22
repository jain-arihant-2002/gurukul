import React from 'react';
import { Course } from '@/utils/types';
import { PrimaryButton } from '@/utils/commonClasses';

const CourseCard = ({ course }: { course: Course; }) => {
    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!CLOUD_NAME) {
        console.error("Cloudinary cloud name is not set in environment variables.");
        return <p>Error: Cloudinary configuration is missing.</p>;
    }
    let src = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/`;
    console.log("Course", course);

    function getShortDescription(description?: string | null) {
        if (!description) return '';
        return description.length > 105 ? description.slice(0, 105) + '...' : description;
    }

    return (<>
        <div className="flex flex-col w-md h-84 min-h-84 max-h-84 justify-between rounded-xl bg-primary-950">
            <img
            className="w-md h-48 object-cover brightness-75 rounded-t"
            src={`${src}${course.coverImageUrl}`}
            alt={course.title}
        />
        <div className='grow'>
            <h3 className="text-secondary-foreground text-xl font-bold p-2 pb-0">{course.title}</h3>
            <p className='p-2 pb-0 self-start'>{getShortDescription(course.description)}</p>
        </div>
            <button className={`${PrimaryButton} rounded-t-none p-2`}>View Details</button>
        </div>
    </>);
};

export default CourseCard;