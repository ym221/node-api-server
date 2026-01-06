import { Request, Response } from 'express';
import { Res } from '../../core/Response';
import { query, queryOne, insert, execute } from '../../config/database';
import { SmartFieldGenerator } from '../../utils/faker';
import { buildPaginatedResponse } from '../../utils/helpers';
import fs from 'fs';
import path from 'path';

// 判断是开发模式还是生产模式
const isDevelopment = process.env.NODE_ENV !== 'production' && __dirname.includes('src');
const GENERATED_DIR = path.join(__dirname, '../../generated');

/**
 * 表结构接口
 */
interface TableColumn {
  Field: string;
  Type: string;
  Null: string;
  Key: string;
  Default: any;
  Extra: string;
}

/**
 * 从模块配置中获取表列表（包含模块信息和描述）
 */
function getTablesFromModules(): Array<{ tableName: string; module: string; description: string }> {
  const tables: Array<{ tableName: string; module: string; description: string }> = [];
  
  if (!fs.existsSync(GENERATED_DIR)) {
    return [];
  }

  try {
    const modules = fs.readdirSync(GENERATED_DIR);
    
    for (const moduleName of modules) {
      const modulePath = path.join(GENERATED_DIR, moduleName);
      const stat = fs.statSync(modulePath);
      
      if (stat.isDirectory()) {
        // 根据环境选择配置文件
        const configPathTs = path.join(modulePath, 'module.config.ts');
        const configPathJs = path.join(modulePath, 'module.config.js');
        const configPath = isDevelopment && fs.existsSync(configPathTs) ? configPathTs : configPathJs;
        
        if (fs.existsSync(configPath)) {
          try {
            // 动态导入模块配置
            delete require.cache[require.resolve(configPath)];
            const config = require(configPath);
            
            const moduleConfig = config.moduleConfig || config.default;
            const tableList = moduleConfig?.tables || [];
            const tableDescriptions = moduleConfig?.tableDescriptions || {};
            
            if (tableList && Array.isArray(tableList)) {
              tableList.forEach(tableName => {
                tables.push({
                  tableName,
                  module: moduleName,
                  description: tableDescriptions[tableName] || moduleConfig?.description || ''
                });
              });
            }
          } catch (error) {
            console.error(`读取模块配置失败 (${moduleName}):`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error('扫描模块目录失败:', error);
  }

  return tables;
}

/**
 * 获取所有数据表
 */
export async function getTables(req: Request, res: Response) {
  try {
    // 从模块配置获取表列表
    const moduleTables = getTablesFromModules();
    
    if (moduleTables.length === 0) {
      // 如果没有模块，返回空数组
      return Res.success(res, [], 'B2B');
    }
    
    // 查询这些表的准确行数
    const data = await Promise.all(moduleTables.map(async (tableInfo) => {
      try {
        const countResult = await queryOne<{ count: number }>(
          `SELECT COUNT(*) as count FROM ${tableInfo.tableName}`
        );
        return {
          name: tableInfo.tableName,
          module: tableInfo.module,
          description: tableInfo.description,
          rows: countResult?.count || 0,
        };
      } catch (error) {
        console.error(`查询表 ${tableInfo.tableName} 行数失败:`, error);
        return {
          name: tableInfo.tableName,
          module: tableInfo.module,
          description: tableInfo.description,
          rows: 0,
        };
      }
    }));

    return Res.success(res, data, 'B2B');
  } catch (error) {
    console.error('获取表列表失败:', error);
    return Res.serverError(res, '获取表列表失败');
  }
}

/**
 * 获取表结构
 */
export async function getTableStructure(req: Request, res: Response) {
  try {
    const { tableName } = req.params;
    
    const columns = await query<TableColumn>(`DESCRIBE ${tableName}`);
    
    return Res.success(res, columns, 'B2B');
  } catch (error) {
    return Res.serverError(res, '获取表结构失败');
  }
}

/**
 * 获取表数据（分页）
 */
export async function getTableData(req: Request, res: Response) {
  try {
    const { tableName } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const limit = Math.min(pageSize, 100);
    const offset = (page - 1) * limit;

    // 构建 WHERE 条件（支持任意字段查询）
    let whereClause = '';
    const queryParams: any[] = [];
    
    // 遍历所有查询参数，排除 page 和 pageSize
    for (const [key, value] of Object.entries(req.query)) {
      if (key !== 'page' && key !== 'pageSize' && value) {
        if (whereClause) {
          whereClause += ' AND ';
        } else {
          whereClause = ' WHERE ';
        }
        whereClause += `${key} LIKE ?`;
        queryParams.push(`%${value}%`);
      }
    }

    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM ${tableName}${whereClause}`;
    const countResult = await queryOne<{ total: number }>(countSql, queryParams.length > 0 ? queryParams : undefined);
    const total = countResult?.total || 0;

    // 获取数据 - 使用直接拼接避免参数绑定问题
    const dataSql = `SELECT * FROM ${tableName}${whereClause} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
    const data = await query(dataSql, queryParams.length > 0 ? queryParams : undefined);

    return Res.success(res, buildPaginatedResponse(data, total, page, limit), 'B2B');
  } catch (error) {
    console.error('获取表数据失败:', error);
    return Res.serverError(res, '获取表数据失败');
  }
}

/**
 * 获取单条记录
 */
export async function getTableRow(req: Request, res: Response) {
  try {
    const { tableName, id } = req.params;
    
    const row = await queryOne(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
    
    if (!row) {
      return Res.notFound(res, '记录不存在');
    }

    return Res.success(res, row, 'B2B');
  } catch (error) {
    return Res.serverError(res, '获取记录失败');
  }
}

/**
 * 创建记录
 */
export async function createTableRow(req: Request, res: Response) {
  try {
    const { tableName } = req.params;
    const data = req.body;

    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map(() => '?').join(', ');

    const insertId = await insert(
      `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return Res.success(res, { id: insertId }, 'B2B', '创建成功');
  } catch (error) {
    return Res.serverError(res, '创建记录失败');
  }
}

/**
 * 更新记录
 */
export async function updateTableRow(req: Request, res: Response) {
  try {
    const { tableName, id } = req.params;
    const data = req.body;

    const fields = Object.keys(data);
    const setClauses = fields.map(field => `${field} = ?`);
    const values = [...Object.values(data), id];

    const affectedRows = await execute(
      `UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE id = ?`,
      values
    );

    if (affectedRows === 0) {
      return Res.notFound(res, '记录不存在');
    }

    return Res.success(res, null, 'B2B', '更新成功');
  } catch (error) {
    return Res.serverError(res, '更新记录失败');
  }
}

/**
 * 删除记录
 */
export async function deleteTableRow(req: Request, res: Response) {
  try {
    const { tableName, id } = req.params;

    const affectedRows = await execute(
      `DELETE FROM ${tableName} WHERE id = ?`,
      [id]
    );

    if (affectedRows === 0) {
      return Res.notFound(res, '记录不存在');
    }

    return Res.success(res, null, 'B2B', '删除成功');
  } catch (error) {
    return Res.serverError(res, '删除记录失败');
  }
}

/**
 * 批量删除记录
 */
export async function batchDeleteTableRows(req: Request, res: Response) {
  try {
    const { tableName } = req.params;
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return Res.badRequest(res, '请提供要删除的ID列表');
    }

    const placeholders = ids.map(() => '?').join(',');
    await execute(`DELETE FROM ${tableName} WHERE id IN (${placeholders})`, ids);

    return Res.success(res, { count: ids.length }, 'B2B', `成功删除 ${ids.length} 条记录`);
  } catch (error) {
    console.error('批量删除失败:', error);
    return Res.serverError(res, '批量删除失败');
  }
}

/**
 * 批量智能生成数据
 */
export async function generateTableData(req: Request, res: Response) {
  try {
    const { tableName } = req.params;
    const { count = 10 } = req.body;

    if (count > 100) {
      return Res.badRequest(res, '生成数量不能超过100');
    }

    // 获取表结构
    const columns = await query<TableColumn>(`DESCRIBE ${tableName}`);
    
    // 过滤掉自动生成的字段
    const fields = columns.filter(col => {
      return col.Extra !== 'auto_increment' && 
             col.Field !== 'created_at' && 
             col.Field !== 'updated_at';
    });

    // 生成数据
    const fieldsInfo = fields.map(f => ({ name: f.Field, type: f.Type }));
    const generatedData = SmartFieldGenerator.generateBatch(fieldsInfo, count);

    // 逐条插入，避免批量插入的参数绑定问题
    let successCount = 0;
    const fieldNames = fields.map(f => f.Field);
    const placeholders = fieldNames.map(() => '?').join(', ');
    const sql = `INSERT INTO ${tableName} (${fieldNames.join(', ')}) VALUES (${placeholders})`;

    for (const data of generatedData) {
      try {
        await execute(sql, Object.values(data));
        successCount++;
      } catch (error: any) {
        console.error(`插入数据失败:`, error.message);
        // 继续插入下一条
      }
    }

    if (successCount === 0) {
      return Res.serverError(res, '生成数据失败');
    }

    return Res.success(res, { count: successCount }, 'B2B', `成功生成 ${successCount} 条数据`);
  } catch (error) {
    console.error(error);
    return Res.serverError(res, '生成数据失败');
  }
}

/**
 * 清空表数据
 */
export async function truncateTable(req: Request, res: Response) {
  try {
    const { tableName } = req.params;

    await execute(`TRUNCATE TABLE ${tableName}`);

    return Res.success(res, null, 'B2B', '表数据已清空');
  } catch (error) {
    return Res.serverError(res, '清空表失败');
  }
}

