import { BaseModel } from '../core/BaseModel';
import { ExampleItem, ExampleListQuery } from './types';

/**
 * Example 数据模型
 */
export class ExampleModel extends BaseModel<ExampleItem> {
  constructor() {
    super('example_table');
  }

  /**
   * 查询列表（带搜索和筛选）
   */
  async findList(query: ExampleListQuery) {
    const { page = 1, pageSize = 20, status, keyword } = query;

    let whereClauses: string[] = [];
    let params: any[] = [];

    // 状态筛选
    if (status !== undefined) {
      whereClauses.push('status = ?');
      params.push(status);
    }

    // 关键词搜索
    if (keyword) {
      whereClauses.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    // 构建 WHERE 子句
    const whereClause = whereClauses.length > 0 
      ? ` WHERE ${whereClauses.join(' AND ')}` 
      : '';

    // 查询总数
    const countSql = `SELECT COUNT(*) as total FROM ${this.tableName}${whereClause}`;
    const countResult = await this.rawQueryOne<{ total: number }>(countSql, params);
    const total = countResult?.total || 0;

    // 查询数据
    const limit = Math.min(pageSize, 100);
    const offset = (page - 1) * limit;
    const dataSql = `SELECT * FROM ${this.tableName}${whereClause} ORDER BY sort_order DESC, id DESC LIMIT ? OFFSET ?`;
    const list = await this.rawQuery<ExampleItem>(dataSql, [...params, limit, offset]);

    return {
      list,
      total,
      page,
      pageSize: limit,
    };
  }
}

