import { api, ApiError } from './http'

async function opcional(promise) {
  try {
    return await promise
  } catch (err) {
    if (err instanceof ApiError && [404, 405, 501].includes(err.status)) {
      return []
    }

    throw err
  }
}

export const healthApi = {
  check: () => api.get('/health', { auth: false }),
}

export const authApi = {
  login: (email, senha) =>
    api.post('/auth/login', { email, senha }, { auth: false }),

  register: (nome, email, senha) =>
    api.post('/auth/register', { nome, email, senha }, { auth: false }),

  me: () => api.get('/auth/me'),
}

export const catalogoApi = {
  cidades: () => api.get('/cidades', { auth: false }),

  hoteis: (params) => api.get('/hoteis', { params, auth: false }),

  quartos: () => api.get('/quartos', { auth: false }),

  hotel: (id) => api.get(`/hoteis/${id}`, { auth: false }),

  // O backend implementa filtros por cidade_id, estrelas_min e busca em GET /hoteis.
  buscar: (params = {}) => api.get('/hoteis', {
    params: {
      cidade_id: params.cidade_id,
      estrelas_min: params.estrelas ?? params.estrelas_min,
      busca: params.busca,
    },
    auth: false,
  }),

  tarifas: (hotelId) =>
    opcional(
      api.get(`/hoteis/${hotelId}/tarifas-temporada`, {
        auth: false,
      }),
    ),

  servicos: () =>
    opcional(
      api.get('/servicos-adicionais', {
        auth: false,
      }),
    ),

  comodidades: () =>
    opcional(
      api.get('/comodidades', {
        auth: false,
      }),
    ),
}

export const reservasApi = {
  criar: (payload) => api.post('/reservas', payload),

  listar: () => api.get('/reservas'),

  obter: (id) => api.get(`/reservas/${id}`),

  cancelar: (id) => api.patch(`/reservas/${id}/cancelar`),
}

export const adminApi = {
  cidades: {
    criar: (v) => api.post('/admin/cidades', v),

    atualizar: (id, v) =>
      api.put(`/admin/cidades/${id}`, v),

    remover: (id) =>
      api.del(`/admin/cidades/${id}`),
  },

  hoteis: {
    criar: (v) => api.post('/admin/hoteis', v),

    atualizar: (id, v) =>
      api.put(`/admin/hoteis/${id}`, v),

    remover: (id) =>
      api.del(`/admin/hoteis/${id}`),
  },
}