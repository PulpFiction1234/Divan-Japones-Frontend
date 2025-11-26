import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import ResizableImageExtension from 'tiptap-extension-resize-image'
import TextAlign from '@tiptap/extension-text-align'
import { 
  FaBold, 
  FaItalic, 
  FaListUl, 
  FaListOl, 
  FaLink, 
  FaImage as FaImageIcon,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaUndo,
  FaRedo
} from 'react-icons/fa'
import '../styles/components/TiptapEditor.css'

export default function TiptapEditor({ content, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Deshabilitar el link de StarterKit para usar nuestra configuración personalizada
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      ResizableImageExtension.configure({
        inline: false,
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  const addLink = () => {
    const url = window.prompt('URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addImage = () => {
    const url = window.prompt('URL de la imagen:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const setImageFloat = (float) => {
    const { state, view } = editor
    const { selection } = state
    
    // Buscar nodo de imagen (soportar tanto imageResize como image)
    let imagePos = null
    let imageNode = null

    state.doc.nodesBetween(selection.from - 1, selection.to + 1, (node, pos) => {
      if (node.type.name === 'imageResize' || node.type.name === 'image') {
        imagePos = pos
        imageNode = node
        return false
      }
    })

    if (imageNode && imagePos !== null) {
      const { tr } = state
      let newAttrs = { ...imageNode.attrs }

      // Si es un nodo <img> normal, actualizamos su atributo `style`
      if (imageNode.type.name === 'image') {
        let style = newAttrs.style || ''

        style = style
          .replace(/float:\s*(left|right|none);?\s*/g, '')
          .replace(/margin:\s*[^;]+;?\s*/g, '')
          .replace(/max-width:\s*[^;]+;?\s*/g, '')
          .trim()

        if (float === 'none') {
          style = 'display: block; margin: 1.5rem auto; float: none; max-width: 80%;'
        } else if (float === 'left') {
          style = `${style} float: left; margin: 0.5rem 1.5rem 1rem 0; max-width: 45%;`.trim()
        } else if (float === 'right') {
          style = `${style} float: right; margin: 0.5rem 0 1rem 1.5rem; max-width: 45%;`.trim()
        }

        newAttrs.style = style
        tr.setNodeMarkup(imagePos, null, newAttrs)
      } else {
        // Nodo imageResize: modificar wrapperStyle para aplicar float
        let wrapperStyle = newAttrs.wrapperStyle || 'display: inline-block;'

        // Limpiar floats y márgenes previos
        wrapperStyle = wrapperStyle
          .replace(/float:\s*(left|right|none);?\s*/g, '')
          .replace(/padding-right:\s*[^;]+;?\s*/g, '')
          .replace(/padding-left:\s*[^;]+;?\s*/g, '')
          .replace(/margin:\s*[^;]+;?\s*/g, '')
          .replace(/max-width:\s*[^;]+;?\s*/g, '')
          .trim()

        if (float === 'none') {
          // Sin float - centrado
          wrapperStyle = 'display: block; margin: 1.5rem auto; float: none; max-width: 80%;'
        } else if (float === 'left') {
          // Float izquierda
          wrapperStyle = `${wrapperStyle} float: left; margin: 0.5rem 1.5rem 1rem 0; max-width: 45%;`.trim()
        } else if (float === 'right') {
          // Float derecha
          wrapperStyle = `${wrapperStyle} float: right; margin: 0.5rem 0 1rem 1.5rem; max-width: 45%;`.trim()
        }

        newAttrs.wrapperStyle = wrapperStyle
        tr.setNodeMarkup(imagePos, null, newAttrs)
      }

      view.dispatch(tr)
      view.focus()
    }
  }

  return (
    <div className="tiptap-editor">
      <div className="tiptap-toolbar">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          title="Negrita"
        >
          <FaBold />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title="Cursiva"
        >
          <FaItalic />
        </button>
        
        <div className="tiptap-toolbar__divider" />
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          title="Lista con viñetas"
        >
          <FaListUl />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          title="Lista numerada"
        >
          <FaListOl />
        </button>
        
        <div className="tiptap-toolbar__divider" />
        
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
          title="Alinear izquierda"
        >
          <FaAlignLeft />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
          title="Alinear centro"
        >
          <FaAlignCenter />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
          title="Alinear derecha"
        >
          <FaAlignRight />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}
          title="Justificar"
        >
          <FaAlignJustify />
        </button>
        
        <div className="tiptap-toolbar__divider" />
        
        <button
          type="button"
          onClick={addLink}
          className={editor.isActive('link') ? 'is-active' : ''}
          title="Insertar enlace"
        >
          <FaLink />
        </button>
        <button
          type="button"
          onClick={addImage}
          title="Insertar imagen"
        >
          <FaImageIcon />
        </button>
        
        <div className="tiptap-toolbar__divider" />
        
        <button
          type="button"
          onClick={() => setImageFloat('left')}
          title="Flotar imagen a la izquierda"
        >
          ⇤
        </button>
        <button
          type="button"
          onClick={() => setImageFloat('right')}
          title="Flotar imagen a la derecha"
        >
          ⇥
        </button>
        <button
          type="button"
          onClick={() => setImageFloat('none')}
          title="Imagen sin flotante"
        >
          ◻
        </button>
        
        <div className="tiptap-toolbar__divider" />
        
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Deshacer"
        >
          <FaUndo />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Rehacer"
        >
          <FaRedo />
        </button>
      </div>
      
      <EditorContent editor={editor} className="tiptap-content" />
    </div>
  )
}
