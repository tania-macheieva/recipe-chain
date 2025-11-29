const API_URL = 'http://localhost:5000/api';

export const recipeAPI = {
  async getAll() {
    const response = await fetch(`${API_URL}/recipes`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getById(id) {
    const response = await fetch(`${API_URL}/recipes/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async create(recipeData) {
    const response = await fetch(`${API_URL}/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipeData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async fork(id, forkData) {
    const response = await fetch(`${API_URL}/recipes/${id}/fork`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(forkData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getChain(id) {
    const response = await fetch(`${API_URL}/recipes/${id}/chain`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getChildren(id) {
    const response = await fetch(`${API_URL}/recipes/${id}/children`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async update(id, updateData) {
    const response = await fetch(`${API_URL}/recipes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async delete(id) {
    const response = await fetch(`${API_URL}/recipes/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  }
};