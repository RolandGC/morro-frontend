import { endpoints } from "@/config/endPoints";
import apiClient from "@/hooks/useAxios";
import type { PaginationResponse } from "@/types/types";
import type { AxiosResponse } from "axios";

import type {
  ElectronicDocument,
  ElectronicDocumentDetail,
  ElectronicDocumentQueryParams,
  ElectronicInvoicingSummary,
  SendBatchResponse,
  SendDocumentResponse,
} from "../types/electronicInvoicing.types";

class ElectronicInvoicingService {
  async getAll(
    params: ElectronicDocumentQueryParams
  ): Promise<AxiosResponse<PaginationResponse<ElectronicDocument>>> {
    return apiClient.get(endpoints.ELECTRONIC_INVOICING.GET_ALL, { params });
  }

  async getById(
    id: string
  ): Promise<AxiosResponse<ElectronicDocumentDetail>> {
    return apiClient.get(`${endpoints.ELECTRONIC_INVOICING.GET_BY_ID}/${id}`);
  }

  async send(
    id: string
  ): Promise<AxiosResponse<SendDocumentResponse>> {
    return apiClient.post(endpoints.ELECTRONIC_INVOICING.POST(id));
  }

  async sendBatch(
    document_ids: string[]
  ): Promise<AxiosResponse<SendBatchResponse>> {
    return apiClient.post(endpoints.ELECTRONIC_INVOICING.SEND_ALL, {
      document_ids,
    });
  }

  async getSummary(
    params?: Pick<ElectronicDocumentQueryParams, "company_id">
  ): Promise<AxiosResponse<ElectronicInvoicingSummary>> {
    return apiClient.get(endpoints.ELECTRONIC_INVOICING.GET_STATUS, { params });
  }
}

export const electronicInvoicingService = new ElectronicInvoicingService();
