import { getAllCourses } from "@/services/course.service";
import { redirect } from "next/navigation";

const page = async () => {
  const [courses, error] = await getAllCourses();
  if (error) {
    redirect('/error'); // Redirect to an error page if fetching fails
  }
  console.log(courses); // For debugging, you can remove this later
  return (
    <div>courses page
      <ol>

      </ol>
    </div>
  )
}

export default page