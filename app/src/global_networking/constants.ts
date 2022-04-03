import axios from "axios";

export const BASE_URL = "http://localhost:4000";

export function axiosPost(route: string, data: any): Promise<any> {
    return axios.post(`${BASE_URL}/${route}`, data);
}
