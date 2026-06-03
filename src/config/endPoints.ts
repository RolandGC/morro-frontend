import { baseUrl } from "./environment";

export const endpoints = {
    AUTH: {
        LOGIN: `${baseUrl}/auth/login`,
    },
    COMPANIES: {
        FIND_ALL: `${baseUrl}/companies`,
    },
    USER_COMPANIES: {
        FIND_ALL: `${baseUrl}/user-companies`,
        SELECT_COMPANY:`${baseUrl}/auth/select-company`,
    }
}