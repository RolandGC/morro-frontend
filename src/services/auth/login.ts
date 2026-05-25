import { endpoints } from "@/config/endPoints"

export interface LoginData {
    email: string;
    password: string;
}

export const svLogin = (data: LoginData): Promise<Response> => {
    return fetch(endpoints.login, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
}