'use client';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { createCourse } from './actions'; // Import your server action
import Toast from '@/app/components/Toast';
import { CreateCourseFormData } from '@/utils/types';
import Editor from '@/app/components/Editor';

interface ToastState { message: string; type: 'success' | 'fail'; isVisible: boolean }

export default function Form({ page }: { page: 'create' | 'update' }) {
    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<CreateCourseFormData>();

    const [value, setValue] = React.useState<string>('Enter detailed description here...');
    const [toast, setToast] = React.useState<ToastState>({
        message: '',
        type: 'success',
        isVisible: false
    });
    // Calling the server action on submit

    const onSubmit = async (data: CreateCourseFormData) => {
        try {

            const result = await createCourse(data as any);

            if (!result.success) {
                console.error("Error creating course:", result.error);
                setToast({
                    message: 'Failed to create course',
                    type: 'fail',
                    isVisible: true
                });
                return;
            }

            reset(); // Reset the form after submission
            setValue('Enter detailed description here...'); // Reset the editor value
            if (result.success) {
                setToast({
                    message: 'Course created successfully!',
                    type: 'success',
                    isVisible: true
                });
                return
            }

        } catch (error: any) {
            console.error("Caught a server exception:", error);
            if (error && error.statusCode === 413) {
                setToast({
                    message: 'Failed to create course as the image is too large. Please upload an image smaller than 1MB.',
                    type: 'fail',
                    isVisible: true
                });
            } else {
                setToast({
                    message: 'Something went wrong while creating the course. Please try again later.',
                    type: 'fail',
                    isVisible: true
                });
            }
        }

    }


    const inputClasses = 'bg-primary-950 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';
    const errorClasses = 'text-red-500 text-sm';


    return (
        <main>
            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} />
            <form className=' flex flex-col gap-5 p-4 rounded mt-4' onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor="title">Course Title</label>
                <input
                    type="text"
                    placeholder="e.g., Introduction to Web Development"
                    className={inputClasses}
                    {...register("title", { required: true, minLength: 5, maxLength: 255 })}
                />
                {errors.title && <span className={errorClasses}>Title is required (5-255 chars)</span>}

                <label htmlFor="description">Course Description</label>
                <textarea
                    placeholder="Provide a short description of your course..."
                    className={inputClasses}
                    {...register("description", { required: true, minLength: 60, maxLength: 200 })}
                />
                {errors.description && <span className={errorClasses}>Description is required (min 60 chars)</span>}
                {/* Todo: add rich text editor */}
                <label htmlFor="detaildescription">Add Detailed Description</label>
                <Controller
                    name="detailDescription"
                    control={control}
                    rules={{
                        required: "Detailed description is required",
                        minLength: { value: 100, message: "Description must be at least 100 characters" }
                    }}
                    render={({ field }) => (
                        <Editor
                            value={value}
                            onChange={(value) => field.onChange(value)}
                        />
                    )}
                />
                {errors.detailDescription && <span className={errorClasses}>Detailed description is required</span>}
                <label htmlFor="price">Price</label>
                <input
                    type="number"
                    placeholder="2999.00"
                    className={inputClasses + ' [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'}
                    {...register("price", { required: true, valueAsNumber: true })}
                    style={{ MozAppearance: 'textfield' }}
                />

                <label htmlFor="categories">Categories</label>
                <input
                    type="string"
                    placeholder="web development, programming, design (Separate categories with commas)"
                    className={inputClasses}
                    {...register("categories", { required: true })}
                />

                {errors.price && <span className={errorClasses}>Price is required</span>}
                {page === 'update' && <label htmlFor="status">Status</label>}
                {page === 'update' && <select className={inputClasses} {...register("status", { required: true })}>
                    <option value="">Select status</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                </select>}
                {errors.status && <span className={errorClasses}>Status is required</span>}
                <label htmlFor="Cover-Image">Cover Image</label>
                <input
                    type="file"
                    accept="image/*"
                    className={inputClasses}
                    {...register("coverImage", { required: true })}
                />
                {errors.coverImage && <span className={errorClasses}>Cover image is required</span>}

                <input disabled={isSubmitting} className='self-end bg-primary-800 rounded text-secondary-foreground px-4 py-2 mt-4' type="submit" value="Create Course" />
            </form>
        </main>
    );
}