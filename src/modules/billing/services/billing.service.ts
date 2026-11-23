import apiClient from "@/hooks/useAxios";
import { endpoints } from "@/config/endPoints";
import type { AxiosResponse } from "axios";
import type {
  BillingAccountResponse,
  BillingSyncResult,
  CompanyBillingResponse,
  UpdateBillingAccountPayload,
  UpdateCompanyBillingPayload,
  UploadCertificatePayload,
} from "../types/billing.types";

const LONG_TIMEOUT_MS = 60000;

class BillingService {
  getCompanyBilling(
    companyId: string,
  ): Promise<AxiosResponse<CompanyBillingResponse>> {
    return apiClient.get(endpoints.BILLING.COMPANY_GET(companyId));
  }

  updateCompanyBilling(
    companyId: string,
    payload: UpdateCompanyBillingPayload,
  ): Promise<AxiosResponse<CompanyBillingResponse>> {
    return apiClient.patch(
      endpoints.BILLING.COMPANY_UPDATE(companyId),
      payload,
      { timeout: LONG_TIMEOUT_MS },
    );
  }

  uploadCertificate(
    companyId: string,
    payload: UploadCertificatePayload,
  ): Promise<AxiosResponse<CompanyBillingResponse>> {
    return apiClient.post(
      endpoints.BILLING.COMPANY_CERTIFICATE(companyId),
      payload,
      { timeout: LONG_TIMEOUT_MS },
    );
  }

  syncCompany(
    companyId: string,
  ): Promise<AxiosResponse<BillingSyncResult>> {
    return apiClient.post(
      endpoints.BILLING.COMPANY_SYNC(companyId),
      {},
      { timeout: LONG_TIMEOUT_MS },
    );
  }

  getAccount(): Promise<AxiosResponse<BillingAccountResponse>> {
    return apiClient.get(endpoints.BILLING.ACCOUNT_GET);
  }

  updateAccount(
    payload: UpdateBillingAccountPayload,
  ): Promise<AxiosResponse<BillingAccountResponse>> {
    return apiClient.put(endpoints.BILLING.ACCOUNT_UPDATE, payload, {
      timeout: LONG_TIMEOUT_MS,
    });
  }

  testAccount(): Promise<AxiosResponse<{ success: boolean; error?: string }>> {
    return apiClient.post(endpoints.BILLING.ACCOUNT_TEST, {}, {
      timeout: LONG_TIMEOUT_MS,
    });
  }
}

export const billingService = new BillingService();
