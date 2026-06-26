import { baseUrl } from "./environment";

export const endpoints = {
    AUTH: {
        LOGIN: `${baseUrl}/auth/login`,
    },
    USERS: {
        FIND_ALL: `${baseUrl}/users`,
        CREATE: `${baseUrl}/users`,
        UPDATE: `${baseUrl}/users`,
        DELETE: `${baseUrl}/users`,
    },
    COMPANIES: {
        FIND_ALL: `${baseUrl}/companies`,
    },
    USER_COMPANIES: {
        FIND_ALL: `${baseUrl}/user-companies`,
        SELECT_COMPANY:`${baseUrl}/auth/select-company`,
    },
    PRODUCTS: {
        FIND_ALL: `${baseUrl}/products`,
        CREATE: `${baseUrl}/products`,
        UPDATE: `${baseUrl}/products`,
        DELETE: `${baseUrl}/products`,
    },
    CATEGORIES: {
        FIND_ALL: `${baseUrl}/categories`,
        CREATE: `${baseUrl}/categories`,
    },
    BRANDS: {
        FIND_ALL: `${baseUrl}/brands`,
        CREATE: `${baseUrl}/brands`,
    },


}