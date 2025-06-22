import { Course } from '@/utils/types'
import React from 'react'
import CourseCard from './CourseCard';


const CourseList = ({ courses }: { courses: Course[] }) => {
    return (
        <ul className="flex gap-4 list-none flex-wrap">  {/* items-stretch w-full*/}
            {courses.map(course => (
                <li key={course.id}>
                    <CourseCard course={course} />
                </li>
            ))}
        </ul>
    );
};

export default CourseList