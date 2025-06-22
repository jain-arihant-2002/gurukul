import { getAllCoursesWithInstructor } from "@/services/course.service";
import CourseList from "../components/CourseList";
import { useCoursesStore } from "@/_store/Store";


const page = async () => {
  const [courses, error] = await getAllCoursesWithInstructor();

  if (error) {
    console.error('Error fetching courses:', error.message);
    return <div>Error loading courses.</div>;
  }

  // Hydrate the Zustand store with fetched courses
  useCoursesStore.getState().setCourses(courses || []);

  return (<>
    <div className="max-w-[80%] mx-auto p-4">
      <div className="pb-4 mb-4 border-b-1 border-primary-600" >
      <h1 className="text-white text-3xl font-bold">Explore Courses</h1>
      <span>Browse our extensive library of courses to find the perfect fit for your learning journey.</span>
      </div>
      {courses && courses.length > 0 ? (
        <CourseList courses={useCoursesStore.getState().courses} />
      ) : (
        <p>No courses available.</p>
      )}
    </div>
  </>
  );
}

export default page