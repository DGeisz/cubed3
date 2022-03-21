import { useEffect, useState } from "react";
import axios from "axios";
import { SERVER_URL } from "./constants";

export async function postToServer<T>(route: string, data: any): Promise<T> {
    return (await axios.post(`${SERVER_URL}/${route}`, data)).data;
}

export interface FetchResponse<T> {
    data?: T;
    loading: boolean;
    error?: any;
    refetch: () => void;
}

export function useFetch<T>(
    fetch: () => T | Promise<T>,
    deps: any[]
): FetchResponse<T> {
    const [data, setData] = useState<T>();
    const [fetchIndex, setFetchIndex] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any | undefined>();

    useEffect(() => {
        (async () => {
            setLoading(true);
            setError(undefined);

            try {
                const newData = await fetch();

                console.log("Calling fetch!", newData);

                setData(newData);
            } catch (e) {
                setError(e);
            }
            setLoading(false);
        })();
    }, [fetchIndex, ...deps]);

    const refetch = () => setFetchIndex((i) => i + 1);

    return {
        data,
        loading,
        error,
        refetch,
    };
}

export function usePostRequest<T>(
    route: string,
    data: any,
    deps: any[]
): FetchResponse<T> {
    return useFetch(() => postToServer<T>(route, data), [route, ...deps]);
}
