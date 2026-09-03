import test from 'node:test'
import assert from 'node:assert/strict'
import { buildPostFormState } from './postEditForm.js'

test('TEST 1: abrir un post en edicion carga el contenido existente en el editor', () => {
  const postFromList = {
    id: 'a-1',
    title: 'Titulo desde listado',
    content: '',
    image: 'https://cdn.example.com/cover.jpg',
    category: 'Ensayo',
    publishedAt: '2026-01-01T00:00:00.000Z',
    isActivity: false,
  }

  const fullPost = {
    id: 'a-1',
    title: 'Titulo desde detalle',
    content: '<p>Contenido importante</p>',
    image: 'https://cdn.example.com/cover.jpg',
    category: 'Ensayo',
    publishedAt: '2026-01-01T00:00:00.000Z',
    isActivity: false,
  }

  const formState = buildPostFormState(postFromList, fullPost)

  assert.equal(formState.title, 'Titulo desde detalle')
  assert.equal(formState.content, '<p>Contenido importante</p>')
  assert.equal(formState.imageUrl, 'https://cdn.example.com/cover.jpg')
})
