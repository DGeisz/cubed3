import axios from "axios";

// export const BASE_URL = "http://localhost:4000";
export const BASE_URL = "https://cube333cube.herokuapp.com";

export function axiosPost(route: string, data: any): Promise<any> {
    return axios.post(`${BASE_URL}/${route}`, data);
}
