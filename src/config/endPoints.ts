import { baseUrl } from "./environment";

export const endpoints = {
    AUTH: {
        LOGIN: `${baseUrl}/auth/login`,
        REGISTER: `${baseUrl}/auth/register`,
        SELECT_COMPANY:`${baseUrl}/auth/select-company`,
        GET_MY_PROFILE: `${baseUrl}/auth/profile`,
    },
    USERS: {
        FIND_ALL: `${baseUrl}/users`,
        CREATE: `${baseUrl}/users`,
        UPDATE: `${baseUrl}/users`,
        DELETE: `${baseUrl}/users`,
        GET_BY_ID: `${baseUrl}/users`,
    },
    COMPANIES: {
        FIND_ALL: `${baseUrl}/companies`,
        CREATE: `${baseUrl}/companies`,
        UPDATE: `${baseUrl}/companies`,
        DELETE: `${baseUrl}/companies`,
        GET_BY_ID: `${baseUrl}/companies`,
    },
    USER_COMPANIES: {
        FIND_ALL: `${baseUrl}/user-companies`,
        ASIGN_COMPANY: `${baseUrl}/user-companies`,
    },
    WAREHOUSES: {
        FIND_ALL: `${baseUrl}/warehouses`,
        CREATE: `${baseUrl}/warehouses`,
        UPDATE: `${baseUrl}/warehouses`,
        DELETE: `${baseUrl}/warehouses`,
        GET_BY_ID: `${baseUrl}/warehouses`,
    },
    CATEGORIES: {
        FIND_ALL: `${baseUrl}/categories`,
        CREATE: `${baseUrl}/categories`,
        UPDATE: `${baseUrl}/categories`,
        DELETE: `${baseUrl}/categories`,
        GET_BY_ID: `${baseUrl}/categories`,
    },
    BRANDS: {
        FIND_ALL: `${baseUrl}/brands`,
        CREATE: `${baseUrl}/brands`,
        UPDATE: `${baseUrl}/brands`,
        DELETE: `${baseUrl}/brands`,
        GET_BY_ID: `${baseUrl}/brands`,
    },
    PRODUCTS: {
        FIND_ALL: `${baseUrl}/products`,
        CREATE: `${baseUrl}/products`,
        UPDATE: `${baseUrl}/products`,
        DELETE: `${baseUrl}/products`,
        GET_BY_ID: `${baseUrl}/products`,
    },
    CUSTOMERS: {
        FIND_ALL: `${baseUrl}/customers`,
        CREATE: `${baseUrl}/customers`,
        UPDATE: `${baseUrl}/customers`,
        DELETE: `${baseUrl}/customers`,
        GET_BY_ID: `${baseUrl}/customers`,
    },
    SUPPLIERS: {
        FIND_ALL: `${baseUrl}/suppliers`,
        CREATE: `${baseUrl}/suppliers`,
        UPDATE: `${baseUrl}/suppliers`,
        DELETE: `${baseUrl}/suppliers`,
        GET_BY_ID: `${baseUrl}/suppliers`,
    },
    CURRENCIES: {
        FIND_ALL: `${baseUrl}/currencies`,
        CREATE: `${baseUrl}/currencies`,
        UPDATE: `${baseUrl}/currencies`,
        DELETE: `${baseUrl}/currencies`,
        GET_BY_ID: `${baseUrl}/currencies`,
    },
    PERMISSIONS: {
        BY_USER: (userId: string) => `${baseUrl}/users/${userId}/permissions`,
    },

}