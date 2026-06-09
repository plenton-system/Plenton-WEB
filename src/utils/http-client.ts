import type { AxiosResponse, AxiosRequestConfig } from 'axios';

import api from '../services/api';

// Converte objeto JS para FormData, incluindo campos aninhados
function toFormData(obj: any, form?: FormData, namespace?: string): FormData {
    const fd = form || new FormData();
    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key) || obj[key] == null) continue;
        const fieldName = namespace ? `${namespace}.${key}` : key;
        const value = obj[key];
        if (value instanceof File) {
            fd.append(fieldName, value);
        } else if (typeof value === "object" && !(value instanceof Date)) {
            toFormData(value, fd, fieldName);
        } else {
            fd.append(fieldName, value);
        }
    }

    return fd;
}

// Métodos utilitários

export async function get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res: AxiosResponse<T> = await api.get(url, config);
    return res.data;
}

export async function del(url: string, config?: AxiosRequestConfig): Promise<number> {
    const res: AxiosResponse = await api.delete(url, config);
    return res.status;
}

export async function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    // Envia como JSON, não faz nada especial
    const res: AxiosResponse<T> = await api.post(url, data, config);
    return res.data;
}

export async function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res: AxiosResponse<T> = await api.put(url, data, config);
    return res.data;
}

export async function postMultipart<T = any>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    const formData = toFormData(data);

    const headers = {
        ...(config?.headers || {}), "Content-Type": "multipart/form-data"
    };

    const res: AxiosResponse<T> = await api.post(url, formData, { ...config, headers });
    return res.data;
}

export async function putMultipart<T = any>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    const formData = toFormData(data);

    const headers = {
        ...(config?.headers || {}), "Content-Type": "multipart/form-data"
    };

    const res: AxiosResponse<T> = await api.put(url, formData, { ...config, headers });
    return res.data;
}
