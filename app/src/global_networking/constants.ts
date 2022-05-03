import axios from "axios";

export const BASE_URL =
    process.env.NEXT_PUBLIC_SERVER_MODE === "DEV"
        ? "http://localhost:4000"
        : "https://cube333cube.herokuapp.com";

console.log(
    "PROCESS ENV server",
    process.env.NEXT_PUBLIC_SERVER_MODE,
    process.env.NEXT_PUBLIC_CLUSTER
);

export function axiosPost(route: string, data: any): Promise<any> {
    return axios.post(`${BASE_URL}/${route}`, data);
}
