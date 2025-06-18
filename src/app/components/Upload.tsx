'use client'

import { useState } from 'react';
import Toast from "@/app/components/Toast";


export default function Upload({ type = "image" }: { type?: "image" | "video" }): React.JSX.Element {

  const [isToastVisible, setIsToastVisible] = useState(false);
  const [message, setMessage] = useState('');


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File | null;

    if (!file) {
      console.error("No file selected");
      return;
    }
    console.log("Selected file:", file);
    //check if the file is an image or video

    if (type === "image" && !file.type.startsWith("image/")) {
      setIsToastVisible(true);
      setMessage('Selected file is not an image');
      // Show toast for 3 seconds
      setTimeout(() => setIsToastVisible(false), 3000);
      return;
    }
    if (type === "video" && !file.type.startsWith("video/")) {
      setIsToastVisible(true);
      setMessage('Selected file is not a video');
      // Show toast for 3 seconds
      setTimeout(() => setIsToastVisible(false), 3000);

      console.error("Selected file is not a video");
      return;
    }
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log('Upload successful:', data);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }
  return (<form encType='multipart/form-data' onSubmit={handleSubmit} action="" >

    <input className='border border-gray-300 rounded-md p-2 ml-4' type='file' name="file"
      accept={type === "image" ? "image/*" : "video/*"}
      required
      id="fileInput"
      placeholder='Select file'
    />
    <button className='bg-blue-500 text-white rounded-md p-2 ml-4' type='submit'>Upload</button>

    <Toast message={message} type='error' isVisible={isToastVisible} />

  </form>)

}


