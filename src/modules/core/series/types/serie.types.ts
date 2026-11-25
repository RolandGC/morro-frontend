import { series_type } from "@/types/types";
import { User } from "../../user/types/user.types";

export interface Serie {
    id: string;
    company_id: string;
    environment: "beta" | "produccion";
    user_id: string;
    series: string;
    type: series_type;
    next_number: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    users: User;
    companies?: {
        id: string;
        name: string | null;
    };
}
export interface SerieQueryParams {
    page?: number;
    limit?: number;
    company_id?: string;
    user_id?: string;
    type?: series_type;
    regime?: "general" | "zofra";
    environment?: "beta" | "produccion" | "all";
    series?: string;
    is_active?: boolean;
}