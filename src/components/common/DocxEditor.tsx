import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import mammoth from "mammoth";
import { Loader2, Save, X, Bold, Italic, Strikethrough, List, ListOrdered, Undo, Redo } from "lucide-react";
import { htmlToDocxBlob } from "./htmlToDocx";

interface DocxEditorProps {
  fileUrl: string;
  fileName: string;
  onSave: (blob: Blob, newFileName: string) => void;
  onCancel: () => void;
}

export const DocxEditor = ({ fileUrl, fileName, onSave, onCancel }: DocxEditorProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class: "prose max-w-none focus:outline-none min-h-[500px] p-6 bg-white shadow-sm ring-1 ring-slate-200",
      },
    },
  });

  useEffect(() => {
    let mounted = true;
    const loadDocx = async () => {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Failed to load document");
        const arrayBuffer = await response.arrayBuffer();

        const result = await mammoth.convertToHtml({ arrayBuffer });
        
        if (mounted && editor) {
          editor.commands.setContent(result.value);
          setIsLoading(false);
        }
      } catch {
        if (mounted) {
          setError("Cannot load document for editing.");
          setIsLoading(false);
        }
      }
    };

    if (editor) {
      void loadDocx();
    }

    return () => {
      mounted = false;
    };
  }, [fileUrl, editor]);

  const handleSave = async () => {
    if (!editor) return;
    setIsSaving(true);
    try {
      const htmlContent = editor.getHTML();
      
      const blob = await htmlToDocxBlob(htmlContent);
      
      // Determine new file name
      const nameParts = fileName.split('.');
      const ext = nameParts.pop() || 'docx';
      const baseName = nameParts.join('.');
      
      let newFileName = '';
      const editedMatch = baseName.match(/_edited(?:_(\d+))?$/);
      if (editedMatch) {
        const count = editedMatch[1] ? parseInt(editedMatch[1], 10) + 1 : 1;
        const baseWithoutEdited = baseName.replace(/_edited(?:_(\d+))?$/, '');
        newFileName = `${baseWithoutEdited}_edited_${count}.${ext}`;
      } else {
        newFileName = `${baseName}_edited.${ext}`;
      }
      
      onSave(blob, newFileName);
    } catch (err) {
      console.error("Failed to generate DOCX:", err);
      setError(`Failed to save document. Error: ${err instanceof Error ? err.message : String(err)}`);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-slate-50 p-6">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-600">Extracting document contents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={onCancel} className="px-4 py-2 bg-slate-200 rounded-md">Close Editor</button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-100">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex items-center gap-1 bg-slate-100 rounded-md p-1">
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-slate-200 ${editor?.isActive('bold') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-slate-200 ${editor?.isActive('italic') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-slate-200 ${editor?.isActive('strike') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </button>
          <div className="w-px h-6 bg-slate-300 mx-1" />
          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-slate-200 ${editor?.isActive('bulletList') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-slate-200 ${editor?.isActive('orderedList') ? 'bg-slate-200 text-blue-600' : 'text-slate-700'}`}
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <div className="w-px h-6 bg-slate-300 mx-1" />
          <button
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            className="p-2 rounded hover:bg-slate-200 text-slate-700 disabled:opacity-50"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            className="p-2 rounded hover:bg-slate-200 text-slate-700 disabled:opacity-50"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Saving..." : "Save as New File"}
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="mx-auto max-w-[850px]">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};
