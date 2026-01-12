import { Response } from 'express';

/**
 * 响应格式类型
 */
export type ResponseFormat = 'ERP' | 'B2B' | 'Ebooking' | 'ticket-web';

/**
 * 响应封装类
 * 支持四种响应格式：ERP（大写字段）、B2B/Ebooking（小写字段）、ticket-web（工单系统格式）
 */
export class Res {
  /**
   * 成功响应
   */
  static success(
    res: Response,
    data: any = null,
    format: ResponseFormat = 'B2B',
    message: string = '操作成功'
  ) {
    const response = this.buildResponse(true, data, message, format, '');
    return res.status(200).json(response);
  }

  /**
   * 失败响应
   */
  static error(
    res: Response,
    message: string = '操作失败',
    format: ResponseFormat = 'B2B',
    code: number = 400,
    data: any = null,
    userMsg: string = ''
  ) {
    const response = this.buildResponse(false, data, message, format, userMsg);
    return res.status(code).json(response);
  }

  /**
   * 分页响应
   */
  static paginated(
    res: Response,
    list: any[],
    total: number,
    page: number,
    pageSize: number,
    format: ResponseFormat = 'B2B'
  ) {
    const totalPages = Math.ceil(total / pageSize);
    
    let data: any;
    
    if (format === 'ERP') {
      // ERP 格式：使用 pagination_info
      data = list; // ERP 格式直接返回列表作为 Data
      const response = {
        Success: true,
        Data: data,
        Message: '操作成功',
        Code: 0,
        pagination_info: {
          page_number: page,
          items_per_page: pageSize,
          total_items: total,
          total_pages: totalPages,
        },
      };
      return res.status(200).json(response);
    } else if (format === 'ticket-web') {
      // ticket-web 格式：工单系统格式
      const response = {
        ErrCode: 0,
        ErrMsg: '',
        Data: {
          List: list,
          Total: total,
          PageSize: pageSize,
          PageIndex: page,
        },
        UserMsg: '',
      };
      return res.status(200).json(response);
    } else {
      // B2B / Ebooking 格式：使用 pagination，code 为 0 表示成功
      data = {
        list,
        pagination: {
          total,
          page,
          pageSize,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
      return this.success(res, data, format);
    }
  }

  /**
   * 构建响应对象
   */
  private static buildResponse(
    success: boolean,
    data: any,
    message: string,
    format: ResponseFormat,
    userMsg: string = ''
  ) {
    if (format === 'ERP') {
      // ERP 格式：大写字段，Code 为 0 表示成功
      return {
        Success: success,
        Data: data,
        Message: message,
        Code: success ? 0 : 400,
      };
    } else if (format === 'ticket-web') {
      // ticket-web 格式：工单系统格式
      return {
        ErrCode: success ? 0 : 400,
        ErrMsg: success ? '' : message,
        Data: data || {},
        UserMsg: userMsg || (success ? '' : message),
      };
    } else {
      // B2B / Ebooking 格式：小写字段，code 为 0 表示成功
      return {
        success,
        data,
        message,
        code: success ? 0 : 400,
      };
    }
  }

  /**
   * 400 Bad Request
   */
  static badRequest(res: Response, message: string = '请求参数错误', format: ResponseFormat = 'B2B') {
    return this.error(res, message, format, 400);
  }

  /**
   * 401 Unauthorized
   */
  static unauthorized(res: Response, message: string = '未授权', format: ResponseFormat = 'B2B') {
    return this.error(res, message, format, 401);
  }

  /**
   * 403 Forbidden
   */
  static forbidden(res: Response, message: string = '禁止访问', format: ResponseFormat = 'B2B') {
    return this.error(res, message, format, 403);
  }

  /**
   * 404 Not Found
   */
  static notFound(res: Response, message: string = '资源不存在', format: ResponseFormat = 'B2B') {
    return this.error(res, message, format, 404);
  }

  /**
   * 500 Internal Server Error
   */
  static serverError(res: Response, message: string = '服务器错误', format: ResponseFormat = 'B2B') {
    return this.error(res, message, format, 500);
  }
}

