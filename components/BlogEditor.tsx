"use client";

import { useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";

type Props = {
  initialContent: string;
  onContentChange: (html: string) => void;
  onUploadImage: (file: File) => Promise<string>;
};

type ToolbarFlags = {
  h2: boolean;
  h3: boolean;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  bullet: boolean;
  ordered: boolean;
  blockquote: boolean;
  link: boolean;
  canUndo: boolean;
  canRedo: boolean;
};

function ToolbarButton({
  title,
  active,
  disabled,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={
        "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 " +
        (active ? "bg-lime-400 text-gray-950" : "text-gray-300 hover:bg-gray-800")
      }
    >
      {children}
    </button>
  );
}

export default function BlogEditor({ initialContent, onContentChange, onUploadImage }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Referensi ke callback terbaru agar handler editorProps (dibuat sekali saat
  // inisialisasi) selalu memanggil versi paling baru dari parent.
  const callbacksRef = useRef({ onContentChange, onUploadImage });
  callbacksRef.current = { onContentChange, onUploadImage };
  const editorRef = useRef<Editor | null>(null);

  async function uploadAndInsert(files: FileList | File[]) {
    const images = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (images.length === 0) return;
    setUploadError("");
    setUploading(true);
    try {
      for (const file of images) {
        const url = await callbacksRef.current.onUploadImage(file);
        editorRef.current
          ?.chain()
          .focus()
          .setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, "") })
          .run();
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload gambar gagal.");
    } finally {
      setUploading(false);
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      Image.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder: "Tulis isi artikel di sini..." }),
    ],
    content: initialContent,
    onUpdate: ({ editor: instance }) => {
      callbacksRef.current.onContentChange(instance.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap blog-editor-surface min-h-72",
      },
      // Gambar yang di-drop / di-paste di-upload dulu, baru disisipkan sebagai
      // URL publik — mencegah konten base64 masuk ke database.
      handleDrop: (_view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;
        event.preventDefault();
        void uploadAndInsert(files);
        return true;
      },
      handlePaste: (_view, event) => {
        const files = event.clipboardData?.files;
        if (!files || files.length === 0) return false;
        event.preventDefault();
        void uploadAndInsert(files);
        return true;
      },
    },
  });
  editorRef.current = editor;

  const flags = useEditorState({
    editor,
    selector: ({ editor: instance }) =>
      instance
        ? ({
            h2: instance.isActive("heading", { level: 2 }),
            h3: instance.isActive("heading", { level: 3 }),
            bold: instance.isActive("bold"),
            italic: instance.isActive("italic"),
            underline: instance.isActive("underline"),
            strike: instance.isActive("strike"),
            bullet: instance.isActive("bulletList"),
            ordered: instance.isActive("orderedList"),
            blockquote: instance.isActive("blockquote"),
            link: instance.isActive("link"),
            canUndo: instance.can().undo(),
            canRedo: instance.can().redo(),
          } satisfies ToolbarFlags)
        : null,
  });

  function setLink() {
    if (!editor) return;
    const previous = (editor.getAttributes("link").href as string | undefined) ?? "";
    const url = window.prompt("URL tautan:", previous || "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 focus-within:border-lime-400">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-800 px-2 py-2">
        <ToolbarButton
          title="Judul 2"
          active={flags?.h2}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          title="Judul 3"
          active={flags?.h3}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-700" />
        <ToolbarButton
          title="Tebal"
          active={flags?.bold}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton
          title="Miring"
          active={flags?.italic}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton
          title="Garis bawah"
          active={flags?.underline}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton
          title="Coret"
          active={flags?.strike}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        >
          <span className="line-through">S</span>
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-700" />
        <ToolbarButton
          title="Daftar butir"
          active={flags?.bullet}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          title="Daftar nomor"
          active={flags?.ordered}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </ToolbarButton>
        <ToolbarButton
          title="Kutipan"
          active={flags?.blockquote}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          &quot; Quote
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-700" />
        <ToolbarButton title="Tautan" active={flags?.link} disabled={!editor} onClick={setLink}>
          Link
        </ToolbarButton>
        <ToolbarButton title="Sisipkan gambar" disabled={!editor} onClick={() => fileInputRef.current?.click()}>
          + Gambar
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-700" />
        <ToolbarButton
          title="Batalkan"
          disabled={!editor || !flags?.canUndo}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          ↺
        </ToolbarButton>
        <ToolbarButton
          title="Ulangi"
          disabled={!editor || !flags?.canRedo}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          ↻
        </ToolbarButton>
        {uploading && <span className="ml-auto text-xs text-lime-400">Mengunggah gambar...</span>}
      </div>

      {uploadError && (
        <p className="border-b border-red-900/60 bg-red-950/30 px-4 py-2 text-xs text-red-300">
          {uploadError}
        </p>
      )}

      <EditorContent editor={editor} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = event.target.files;
          if (files?.length) void uploadAndInsert(files);
          event.target.value = "";
        }}
      />
    </div>
  );
}
