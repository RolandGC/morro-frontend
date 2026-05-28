export interface PaginationResponse<T> {
    "meta": {
        "total": 1,
        "page": 1,
        "limit": 20,
        "totalPages": 1
    }
    "data": T[]
}