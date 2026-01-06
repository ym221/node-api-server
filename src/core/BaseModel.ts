import { pool, query, queryOne, insert, execute } from '../config/database';
import { calculatePagination } from '../utils/helpers';

/**
 * 数据模型基类
 * 提供通用的 CRUD 方法
 */
export class BaseModel<T = any> {
  constructor(protected tableName: string) {}

  /**
   * 查询所有记录
   */
  async findAll(conditions?: Partial<T>): Promise<T[]> {
    let sql = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];

    if (conditions && Object.keys(conditions).length > 0) {
      const whereClauses = Object.keys(conditions).map(key => `${key} = ?`);
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
      params.push(...Object.values(conditions));
    }

    return await query<T>(sql, params);
  }

  /**
   * 根据 ID 查询
   */
  async findById(id: number | string): Promise<T | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    return await queryOne<T>(sql, [id]);
  }

  /**
   * 查询单条记录
   */
  async findOne(conditions: Partial<T>): Promise<T | null> {
    const whereClauses = Object.keys(conditions).map(key => `${key} = ?`);
    const sql = `SELECT * FROM ${this.tableName} WHERE ${whereClauses.join(' AND ')} LIMIT 1`;
    const params = Object.values(conditions);
    return await queryOne<T>(sql, params);
  }

  /**
   * 分页查询
   */
  async findPaginated(
    page: number = 1,
    pageSize: number = 20,
    conditions?: Partial<T>,
    orderBy: string = 'id DESC'
  ): Promise<{ list: T[]; total: number; page: number; pageSize: number }> {
    const { currentPage, limit, offset } = calculatePagination(page, pageSize);

    // 构建 WHERE 子句
    let whereClause = '';
    const params: any[] = [];
    
    if (conditions && Object.keys(conditions).length > 0) {
      const whereClauses = Object.keys(conditions).map(key => `${key} = ?`);
      whereClause = ` WHERE ${whereClauses.join(' AND ')}`;
      params.push(...Object.values(conditions));
    }

    // 查询总数
    const countSql = `SELECT COUNT(*) as total FROM ${this.tableName}${whereClause}`;
    const countResult = await queryOne<{ total: number }>(countSql, params);
    const total = countResult?.total || 0;

    // 查询数据
    const dataSql = `SELECT * FROM ${this.tableName}${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    const list = await query<T>(dataSql, [...params, limit, offset]);

    return {
      list,
      total,
      page: currentPage,
      pageSize: limit,
    };
  }

  /**
   * 创建记录
   */
  async create(data: Partial<T>): Promise<number> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map(() => '?').join(', ');

    const sql = `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
    return await insert(sql, values);
  }

  /**
   * 批量创建
   */
  async createBatch(dataList: Partial<T>[]): Promise<number> {
    if (dataList.length === 0) return 0;

    const fields = Object.keys(dataList[0]);
    const placeholders = fields.map(() => '?').join(', ');
    const valuesSql = dataList.map(() => `(${placeholders})`).join(', ');

    const sql = `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES ${valuesSql}`;
    const params = dataList.flatMap(data => Object.values(data));

    const result = await execute(sql, params);
    return result;
  }

  /**
   * 更新记录
   */
  async update(id: number | string, data: Partial<T>): Promise<number> {
    const fields = Object.keys(data);
    const setClauses = fields.map(field => `${field} = ?`);
    const sql = `UPDATE ${this.tableName} SET ${setClauses.join(', ')} WHERE id = ?`;
    const params = [...Object.values(data), id];

    return await execute(sql, params);
  }

  /**
   * 批量更新
   */
  async updateBatch(conditions: Partial<T>, data: Partial<T>): Promise<number> {
    const setFields = Object.keys(data);
    const setClauses = setFields.map(field => `${field} = ?`);
    
    const whereFields = Object.keys(conditions);
    const whereClauses = whereFields.map(field => `${field} = ?`);

    const sql = `UPDATE ${this.tableName} SET ${setClauses.join(', ')} WHERE ${whereClauses.join(' AND ')}`;
    const params = [...Object.values(data), ...Object.values(conditions)];

    return await execute(sql, params);
  }

  /**
   * 删除记录
   */
  async delete(id: number | string): Promise<number> {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    return await execute(sql, [id]);
  }

  /**
   * 批量删除
   */
  async deleteBatch(conditions: Partial<T>): Promise<number> {
    const whereFields = Object.keys(conditions);
    const whereClauses = whereFields.map(field => `${field} = ?`);
    const sql = `DELETE FROM ${this.tableName} WHERE ${whereClauses.join(' AND ')}`;
    const params = Object.values(conditions);

    return await execute(sql, params);
  }

  /**
   * 统计数量
   */
  async count(conditions?: Partial<T>): Promise<number> {
    let sql = `SELECT COUNT(*) as total FROM ${this.tableName}`;
    const params: any[] = [];

    if (conditions && Object.keys(conditions).length > 0) {
      const whereClauses = Object.keys(conditions).map(key => `${key} = ?`);
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
      params.push(...Object.values(conditions));
    }

    const result = await queryOne<{ total: number }>(sql, params);
    return result?.total || 0;
  }

  /**
   * 检查是否存在
   */
  async exists(conditions: Partial<T>): Promise<boolean> {
    const count = await this.count(conditions);
    return count > 0;
  }

  /**
   * 原始 SQL 查询
   */
  async rawQuery<R = any>(sql: string, params?: any[]): Promise<R[]> {
    return await query<R>(sql, params);
  }

  /**
   * 原始 SQL 查询（单条）
   */
  async rawQueryOne<R = any>(sql: string, params?: any[]): Promise<R | null> {
    return await queryOne<R>(sql, params);
  }

  /**
   * 清空表数据
   */
  async truncate(): Promise<void> {
    await execute(`TRUNCATE TABLE ${this.tableName}`);
  }

  /**
   * 获取表结构
   */
  async getTableStructure(): Promise<any[]> {
    return await query(`DESCRIBE ${this.tableName}`);
  }
}

