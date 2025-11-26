const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '')

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    const message = typeof body === 'string' && body ? body : body?.error
    throw new Error(message || `Error ${response.status}`)
  }

  return body
}

export async function fetchArticles({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/articles`, { signal })
  return parseResponse(response)
}

export async function createArticle(payload, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/articles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  return parseResponse(response)
}

export async function updateArticle(id, payload, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  return parseResponse(response)
}

export async function deleteArticle(id, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
    method: 'DELETE',
    signal,
  })

  return parseResponse(response)
}

export async function fetchMagazines({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/magazines`, { signal })
  return parseResponse(response)
}

export async function createMagazine(payload, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/magazines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  return parseResponse(response)
}

export async function updateMagazine(id, payload, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/magazines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  return parseResponse(response)
}

export async function deleteMagazine(id, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/magazines/${id}`, {
    method: 'DELETE',
    signal,
  })

  return parseResponse(response)
}

export async function fetchMagazineArticles(magazineId, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/magazines/${magazineId}/articles`, { signal })
  return parseResponse(response)
}

export async function createMagazineArticle(magazineId, payload, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/magazines/${magazineId}/articles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  return parseResponse(response)
}

export async function updateMagazineArticle(magazineId, articleId, payload, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/magazines/${magazineId}/articles/${articleId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  return parseResponse(response)
}

export async function deleteMagazineArticle(magazineId, articleId, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/magazines/${magazineId}/articles/${articleId}`, {
    method: 'DELETE',
    signal,
  })

  return parseResponse(response)
}

export function getApiBaseUrl() {
  return API_BASE_URL
}

// ===== CATEGORIES API =====

export async function fetchCategories({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/categories`, { signal })
  return parseResponse(response)
}

export async function createCategory(payload, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  return parseResponse(response)
}

export async function deleteCategory(id, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'DELETE',
    signal,
  })

  return parseResponse(response)
}

// ===== AUTHORS API =====

export async function fetchAuthors({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/authors`, { signal })
  return parseResponse(response)
}

export async function createAuthor(payload, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/authors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  return parseResponse(response)
}

export async function deleteAuthor(id, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/authors/${id}`, {
    method: 'DELETE',
    signal,
  })

  return parseResponse(response)
}
