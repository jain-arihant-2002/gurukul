'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Toolbar } from './Toolbar'

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const Editor = ({ value, onChange }: EditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class:
          'prose prose-invert bg-primary-950 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px] w-full max-w-none',
      }
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    }
  });


  return (
    <div >
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

export default Editor

