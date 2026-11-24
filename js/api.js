/*
  API client của xDTU.
  Sửa API_BASE theo địa chỉ ASP.NET Core Backend.
  Các hàm trả về JSON; lỗi HTTP sẽ được ném thành Error.
*/
const API_BASE = "https://reel-highway-upgrading-activity.trycloudflare.com";

const Api = {
  token: () => localStorage.getItem("xdtu_token"),
  async request(path, options = {}) {
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
    const headers = { ...(options.headers || {}) };
    if (options.body !== undefined && !isFormData) headers["Content-Type"] = "application/json";
    const token = this.token();
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!response.ok) {
      const message = (data && (data.message || data.title)) || `Yêu cầu thất bại (${response.status})`;
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  },
  get(path) { return this.request(path); },
  post(path, body) { return this.request(path, { method: "POST", body: JSON.stringify(body) }); },
  postForm(path, body) { return this.request(path, { method: "POST", body }); },
  put(path, body) { return this.request(path, { method: "PUT", body: JSON.stringify(body) }); },
  putForm(path, body) { return this.request(path, { method: "PUT", body }); },
  patch(path, body) { return this.request(path, { method: "PATCH", body: JSON.stringify(body) }); },
  delete(path) { return this.request(path, { method: "DELETE" }); },
  async download(path) {
    const headers = {};
    const token = this.token();
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API_BASE}${path}`, { headers });
    if (!response.ok) {
      const text = await response.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = text; }
      const message = (data && (data.message || data.title)) || `Yêu cầu thất bại (${response.status})`;
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return {
      blob: await response.blob(),
      contentDisposition: response.headers.get("Content-Disposition") || ""
    };
  }
};
