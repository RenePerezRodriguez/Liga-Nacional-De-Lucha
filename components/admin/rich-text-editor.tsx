"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useRef, useState, useCallback } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from "@/lib/firebase";
import { compressImage } from "@/lib/image-compression";
import {
    Bold,
    Italic,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Link as LinkIcon,
    Image as ImageIcon,
    Undo,
    Redo,
    Code,
    Minus,
    Upload,
    Loader2,
    X,
    ExternalLink,
    ImagePlus
} from "lucide-react";

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

// Custom Modal Component
function Modal({
    isOpen,
    onClose,
    title,
    children
}: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" onClick={onClose} />
            <div className="relative bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export function RichTextEditor({ content, onChange, placeholder = "Escribe el contenido..." }: RichTextEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState("");

    // Modal states
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showImageUrlModal, setShowImageUrlModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [linkText, setLinkText] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    // Upload image to Firebase and return URL
    const uploadImage = useCallback(async (file: File): Promise<string | null> => {
        // Check authentication
        if (!auth.currentUser) {
            console.error("User not authenticated for upload");
            alert("Debes iniciar sesión para subir imágenes.");
            return null;
        }

        try {
            // Try to compress image, fallback to original if it fails
            let fileToUpload = file;
            try {
                fileToUpload = await compressImage(file);
            } catch (compressError) {
                console.warn("Image compression failed, using original:", compressError);
            }

            // Upload to Firebase
            const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const storageRef = ref(storage, `news-content/${fileName}`);

            // Add metadata
            const metadata = {
                customMetadata: {
                    originalName: file.name,
                    uploader: auth.currentUser.uid
                }
            };

            const snapshot = await uploadBytes(storageRef, fileToUpload, metadata);
            const imageUrl = await getDownloadURL(snapshot.ref);

            return imageUrl;
        } catch (error: unknown) {
            console.error("Error uploading image to Firebase:", error);
            const err = error as { code?: string; message?: string };

            // Helpful alerts for common errors
            if (err.code === 'storage/unauthorized') {
                alert("No tienes permiso para subir imágenes. Verifica tu sesión.");
            } else if (err.code === 'storage/retry-limit-exceeded') {
                alert("La subida tardó demasiado. Verifica tu conexión.");
            } else {
                alert(`Error al subir imagen: ${err.message || 'Error desconocido'}`);
            }

            return null;
        }
    }, []);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3]
                }
            }),
            ImageExtension.configure({
                HTMLAttributes: {
                    class: "max-w-full rounded-lg my-4"
                },
                allowBase64: true
            }),
            Placeholder.configure({
                placeholder
            })
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-invert prose-sm max-w-none min-h-[300px] p-4 focus:outline-none"
            },
            // Handle pasted images
            handlePaste: (view, event) => {
                const items = event.clipboardData?.items;
                if (!items) return false;

                for (const item of items) {
                    if (item.type.startsWith('image/')) {
                        event.preventDefault();
                        const file = item.getAsFile();
                        if (file) {
                            handleImageFile(file);
                        }
                        return true;
                    }
                }
                return false;
            },
            // Handle dropped images
            handleDrop: (view, event) => {
                const files = event.dataTransfer?.files;
                if (!files || files.length === 0) return false;

                for (const file of files) {
                    if (file.type.startsWith('image/')) {
                        event.preventDefault();
                        handleImageFile(file);
                        return true;
                    }
                }
                return false;
            }
        }
    });

    // Handle image file (from upload, paste, or drop)
    const handleImageFile = async (file: File) => {
        if (!editor) return;

        setUploading(true);
        setUploadProgress("Subiendo imagen...");

        try {
            const url = await uploadImage(file);
            if (url) {
                editor.chain().focus().setImage({ src: url }).run();
            } else {
                alert("Error al subir imagen. Verifica tu conexión o permisos de Firebase.");
            }
        } finally {
            setUploading(false);
            setUploadProgress("");
        }
    };

    if (!editor) {
        return <div className="bg-black rounded-lg p-4 min-h-[300px] animate-pulse" />;
    }

    // Helper to ensure URL has protocol
    const ensureUrlProtocol = (url: string) => {
        if (!url) return "";
        if (url.startsWith("/") || url.startsWith("#") || url.startsWith("mailto:")) return url;
        if (/^[a-zA-Z0-9][-a-zA-Z0-9]+:/.test(url)) return url; // Already has protocol

        return `https://${url}`;
    };

    // Link modal handlers
    const openLinkModal = () => {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to);
        setLinkText(selectedText);
        setLinkUrl("");
        setShowLinkModal(true);
    };

    const insertLink = () => {
        if (linkUrl) {
            const finalUrl = ensureUrlProtocol(linkUrl);

            if (linkText && editor.state.selection.empty) {
                // Insert new link with text
                editor.chain().focus()
                    .insertContent(`<a href="${finalUrl}">${linkText}</a>`)
                    .run();
            } else {
                // Apply link to selection
                editor.chain().focus()
                    .setLink({ href: finalUrl })
                    .run();
            }
        }
        setShowLinkModal(false);
        setLinkUrl("");
        setLinkText("");
    };

    // Image URL modal handlers
    const openImageUrlModal = () => {
        setImageUrl("");
        setShowImageUrlModal(true);
    };

    const insertImageByUrl = () => {
        if (imageUrl) {
            const finalUrl = ensureUrlProtocol(imageUrl);
            editor.chain().focus().setImage({ src: finalUrl }).run();
        }
        setShowImageUrlModal(false);
        setImageUrl("");
    };

    const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await handleImageFile(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <>
            <div className="border border-zinc-700 rounded-xl overflow-hidden bg-black">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 border-b border-zinc-800 bg-zinc-900">
                    {/* History */}
                    <ToolButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="Deshacer"
                    >
                        <Undo className="w-4 h-4" />
                    </ToolButton>
                    <ToolButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="Rehacer"
                    >
                        <Redo className="w-4 h-4" />
                    </ToolButton>

                    <Separator />

                    {/* Text Formatting */}
                    <ToolButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        active={editor.isActive("bold")}
                        title="Negrita (Ctrl+B)"
                    >
                        <Bold className="w-4 h-4" />
                    </ToolButton>
                    <ToolButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        active={editor.isActive("italic")}
                        title="Cursiva (Ctrl+I)"
                    >
                        <Italic className="w-4 h-4" />
                    </ToolButton>
                    <ToolButton
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        active={editor.isActive("code")}
                        title="Código"
                    >
                        <Code className="w-4 h-4" />
                    </ToolButton>

                    <Separator />

                    {/* Headings */}
                    <ToolButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        active={editor.isActive("heading", { level: 1 })}
                        title="Título 1"
                    >
                        <Heading1 className="w-4 h-4" />
                    </ToolButton>
                    <ToolButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        active={editor.isActive("heading", { level: 2 })}
                        title="Título 2"
                    >
                        <Heading2 className="w-4 h-4" />
                    </ToolButton>
                    <ToolButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        active={editor.isActive("heading", { level: 3 })}
                        title="Título 3"
                    >
                        <Heading3 className="w-4 h-4" />
                    </ToolButton>

                    <Separator />

                    {/* Lists */}
                    <ToolButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        active={editor.isActive("bulletList")}
                        title="Lista con viñetas"
                    >
                        <List className="w-4 h-4" />
                    </ToolButton>
                    <ToolButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        active={editor.isActive("orderedList")}
                        title="Lista numerada"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </ToolButton>
                    <ToolButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        active={editor.isActive("blockquote")}
                        title="Cita"
                    >
                        <Quote className="w-4 h-4" />
                    </ToolButton>
                    <ToolButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        title="Línea horizontal"
                    >
                        <Minus className="w-4 h-4" />
                    </ToolButton>

                    <Separator />

                    {/* Link */}
                    <ToolButton
                        onClick={openLinkModal}
                        active={editor.isActive("link")}
                        title="Insertar enlace"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </ToolButton>

                    {/* Image by URL */}
                    <ToolButton
                        onClick={openImageUrlModal}
                        title="Imagen por URL"
                    >
                        <ImageIcon className="w-4 h-4" />
                    </ToolButton>

                    {/* Upload Image Button */}
                    <label
                        className={`p-2 rounded transition-colors cursor-pointer flex items-center gap-1 ${uploading
                            ? "text-lnl-gold bg-lnl-gold/20 cursor-wait"
                            : "text-gray-400 hover:bg-zinc-800 hover:text-white"
                            }`}
                        title="Subir imagen desde tu computadora"
                    >
                        {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Upload className="w-4 h-4" />
                        )}
                        <span className="text-xs hidden sm:inline">Subir</span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileInputChange}
                            className="hidden"
                            disabled={uploading}
                        />
                    </label>
                </div>

                {/* Upload indicator */}
                {uploading && (
                    <div className="bg-lnl-gold/10 border-b border-lnl-gold/30 px-4 py-2 text-xs text-lnl-gold flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {uploadProgress || "Subiendo imagen..."}
                    </div>
                )}

                {/* Editor */}
                <EditorContent editor={editor} />

                {/* Footer */}
                <div className="p-2 border-t border-zinc-800 text-xs text-gray-500 flex justify-between items-center">
                    <span className="text-gray-600">💡 Puedes pegar imágenes (Ctrl+V) o arrastrarlas al editor</span>
                    <span>{editor.storage.characterCount?.words?.() || countWords(editor.getText())} palabras</span>
                </div>
            </div>

            {/* Link Modal */}
            <Modal
                isOpen={showLinkModal}
                onClose={() => setShowLinkModal(false)}
                title="Insertar Enlace"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400 block mb-1">
                            URL del enlace
                        </label>
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://ejemplo.com"
                            className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400 block mb-1">
                            Texto del enlace (opcional)
                        </label>
                        <input
                            type="text"
                            value={linkText}
                            onChange={(e) => setLinkText(e.target.value)}
                            placeholder="Texto a mostrar"
                            className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold"
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={() => setShowLinkModal(false)}
                            className="px-4 py-2 text-gray-400 hover:text-white"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={insertLink}
                            disabled={!linkUrl}
                            className="px-4 py-2 bg-lnl-gold text-black rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                        >
                            <ExternalLink className="w-4 h-4" /> Insertar
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Image URL Modal */}
            <Modal
                isOpen={showImageUrlModal}
                onClose={() => setShowImageUrlModal(false)}
                title="Insertar Imagen por URL"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400 block mb-1">
                            URL de la imagen
                        </label>
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://ejemplo.com/imagen.jpg"
                            className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-lnl-gold"
                            autoFocus
                        />
                    </div>
                    {imageUrl && (
                        <div className="border border-zinc-700 rounded-lg overflow-hidden bg-zinc-800">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={imageUrl}
                                alt="Vista previa"
                                className="max-h-40 mx-auto object-contain"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                        </div>
                    )}
                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={() => setShowImageUrlModal(false)}
                            className="px-4 py-2 text-gray-400 hover:text-white"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={insertImageByUrl}
                            disabled={!imageUrl}
                            className="px-4 py-2 bg-lnl-gold text-black rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                        >
                            <ImagePlus className="w-4 h-4" /> Insertar
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

function ToolButton({
    onClick,
    active,
    disabled,
    title,
    children
}: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-2 rounded transition-colors ${active
                ? "bg-lnl-gold text-black"
                : disabled
                    ? "text-zinc-600 cursor-not-allowed"
                    : "text-gray-400 hover:bg-zinc-800 hover:text-white"
                }`}
        >
            {children}
        </button>
    );
}

function Separator() {
    return <div className="w-px h-6 bg-zinc-700 mx-1" />;
}

function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
}
