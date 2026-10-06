import apiClient from "@/hooks/useAxios";
import { endpoints } from "@/config/endPoints";
import { AxiosResponse } from "axios";
import {
  LowStockReport,
  PaymentsReportFile,
  PaymentsReportQueryParams,
  ReceivablesAgingReport,
  ReportQueryParams,
  ReportSummary,
  SalesByDayReport,
  SalesByPaymentMethodReport,
  TopProductsQueryParams,
  TopProductsReport,
} from "../types/report.types";

/** Reportes pesados (PDF/Excel) pueden tardar más que el timeout por defecto. */
const EXPORT_TIMEOUT_MS = 60000;

class ReportService {
  async getSummary(
    params: ReportQueryParams,
  ): Promise<AxiosResponse<ReportSummary>> {
    const response = await apiClient.get(endpoints.REPORTS.SUMMARY, { params });
    return response;
  }

  async getSalesByDay(
    params: ReportQueryParams,
  ): Promise<AxiosResponse<SalesByDayReport>> {
    const response = await apiClient.get(endpoints.REPORTS.SALES_BY_DAY, {
      params,
    });
    return response;
  }

  async getSalesByPaymentMethod(
    params: ReportQueryParams,
  ): Promise<AxiosResponse<SalesByPaymentMethodReport>> {
    const response = await apiClient.get(
      endpoints.REPORTS.SALES_BY_PAYMENT_METHOD,
      { params },
    );
    return response;
  }

  async getTopProducts(
    params: TopProductsQueryParams,
  ): Promise<AxiosResponse<TopProductsReport>> {
    const response = await apiClient.get(endpoints.REPORTS.TOP_PRODUCTS, {
      params,
    });
    return response;
  }

  async getLowStock(
    params: ReportQueryParams,
  ): Promise<AxiosResponse<LowStockReport>> {
    const response = await apiClient.get(endpoints.REPORTS.LOW_STOCK, {
      params,
    });
    return response;
  }

  async getReceivablesAging(
    params: ReportQueryParams,
  ): Promise<AxiosResponse<ReceivablesAgingReport>> {
    const response = await apiClient.get(endpoints.REPORTS.RECEIVABLES_AGING, {
      params,
    });
    return response;
  }

  async exportPayments(
    params: PaymentsReportQueryParams,
  ): Promise<AxiosResponse<PaymentsReportFile>> {
    const response = await apiClient.get(endpoints.REPORTS.PAYMENTS_EXPORT, {
      params,
      timeout: EXPORT_TIMEOUT_MS,
    });
    return response;
  }
}

export const reportService = new ReportService();
