import { series_type } from "@/types/types";
import { User } from "../../user/types/user.types";

export interface Serie {
    id: string;
    user_id: string;
    series: string;
    type: series_type;
    next_number: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    users: User;
}
export interface SerieQueryParams {
    page?: number;
    limit?: number;
    user_id?: string;
    type?: series_type;
    series?: string;
    is_active?: boolean;
}