/**
 * Loan Controller
 * File này chứa các HTTP handlers cho loan endpoints
 * Controller layer - xử lý HTTP request/response, gọi service layer
 */
import { Request, Response } from 'express';
import { LoanService } from './loan.service';
import { handleError } from '../../utils/error-handler';
import { CreateLoanData, UpdateLoanData, CreateLoanPaymentData, GetLoansQuery, GetLoanPaymentsQuery } from './loan.schema';

export const LoanController = {
  /**
   * POST /loans
   * Tạo khoản nợ/cho vay mới
   */
  async createLoan(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const data: CreateLoanData = req.body;

      const loan = await LoanService.createLoan(data, userId);

      res.status(201).json({
        success: true,
        data: loan,
        message: 'Tạo khoản nợ thành công'
      });
    } catch (error) {
      handleError(error, res);
    }
  },

  /**
   * GET /loans
   * Lấy danh sách khoản nợ/cho vay
   */
  async getLoans(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const filters: GetLoansQuery = req.query as any;

      const result = await LoanService.getLoans(userId, filters);

      res.json({
        success: true,
        data: result.loans,
        pagination: result.pagination
      });
    } catch (error) {
      handleError(error, res);
    }
  },

  /**
   * GET /loans/stats/summary
   * Lấy thống kê tổng quan khoản nợ
   */
  async getLoanStats(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;

      const stats = await LoanService.getLoanStats(userId);

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      handleError(error, res);
    }
  },

  /**
   * GET /loans/:id
   * Lấy chi tiết khoản nợ theo ID
   */
  async getLoan(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const loanId = req.params.id;

      const loan = await LoanService.getLoanById(loanId, userId);

      if (!loan) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khoản nợ'
        });
      }

      res.json({
        success: true,
        data: loan
      });
    } catch (error) {
      handleError(error, res);
    }
  },

  /**
   * PUT /loans/:id
   * Cập nhật khoản nợ
   */
  async updateLoan(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const loanId = req.params.id;
      const data: UpdateLoanData = req.body;

      const loan = await LoanService.updateLoan(loanId, userId, data);

      res.json({
        success: true,
        data: loan,
        message: 'Cập nhật khoản nợ thành công'
      });
    } catch (error) {
      handleError(error, res);
    }
  },

  /**
   * DELETE /loans/:id
   * Xóa khoản nợ (soft delete)
   */
  async deleteLoan(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const loanId = req.params.id;

      await LoanService.deleteLoan(loanId, userId);

      res.json({
        success: true,
        message: 'Xóa khoản nợ thành công'
      });
    } catch (error) {
      handleError(error, res);
    }
  },

  /**
   * POST /loan-payments
   * Tạo thanh toán khoản nợ
   */
  async createLoanPayment(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const data: CreateLoanPaymentData = req.body;

      const payment = await LoanService.createLoanPayment(data, userId);

      res.status(201).json({
        success: true,
        data: payment,
        message: 'Tạo thanh toán thành công'
      });
    } catch (error) {
      handleError(error, res);
    }
  },

  /**
   * GET /loan-payments
   * Lấy danh sách thanh toán khoản nợ
   */
  async getLoanPayments(req: Request, res: Response) {
    try {
      const userId = req.user!.sub;
      const filters: GetLoanPaymentsQuery = req.query as any;

      const result = await LoanService.getLoanPayments(userId, filters);

      res.json({
        success: true,
        data: result.payments,
        pagination: result.pagination
      });
    } catch (error) {
      handleError(error, res);
    }
  }
};