import { Request, Response } from 'express';
import { Res } from '../../core/Response';
import { execute } from '../../config/database';
import fs from 'fs';
import path from 'path';

const GENERATED_DIR = path.join(__dirname, '../../generated');

/**
 * 模块信息接口
 */
interface ModuleInfo {
  name: string;
  path: string;
  hasPrompt: boolean;
  hasConfig: boolean;
  hasSchema: boolean;
  files: string[];
  createdAt?: Date;
  size?: number;
}

/**
 * 扫描生成的模块
 */
function scanModules(): ModuleInfo[] {
  if (!fs.existsSync(GENERATED_DIR)) {
    return [];
  }

  const modules: ModuleInfo[] = [];
  const items = fs.readdirSync(GENERATED_DIR);

  for (const item of items) {
    const modulePath = path.join(GENERATED_DIR, item);
    const stat = fs.statSync(modulePath);

    if (stat.isDirectory()) {
      const files = fs.readdirSync(modulePath);
      
      modules.push({
        name: item,
        path: modulePath,
        hasPrompt: files.includes('.prompt.md'),
        hasConfig: files.includes('module.config.ts'),
        hasSchema: files.includes('schema.sql'),
        files,
        createdAt: stat.birthtime,
        size: calculateDirSize(modulePath),
      });
    }
  }

  return modules;
}

/**
 * 计算目录大小
 */
function calculateDirSize(dirPath: string): number {
  let size = 0;
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile()) {
      size += stat.size;
    }
  }

  return size;
}

/**
 * 获取模块列表
 */
export function getModules(req: Request, res: Response) {
  try {
    const modules = scanModules();
    return Res.success(res, modules, 'B2B');
  } catch (error) {
    return Res.serverError(res, '获取模块列表失败');
  }
}

/**
 * 获取模块详情
 */
export function getModuleDetail(req: Request, res: Response) {
  try {
    const { moduleName } = req.params;
    const modulePath = path.join(GENERATED_DIR, moduleName);

    if (!fs.existsSync(modulePath)) {
      return Res.notFound(res, '模块不存在');
    }

    const files = fs.readdirSync(modulePath);
    const details: any = {
      name: moduleName,
      path: modulePath,
      files: [],
    };

    // 读取文件内容
    for (const file of files) {
      const filePath = path.join(modulePath, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile()) {
        details.files.push({
          name: file,
          size: stat.size,
          modified: stat.mtime,
        });

        // 读取特殊文件内容
        if (file === '.prompt.md') {
          details.prompt = fs.readFileSync(filePath, 'utf-8');
        } else if (file === 'module.config.ts') {
          details.config = fs.readFileSync(filePath, 'utf-8');
        } else if (file === 'schema.sql') {
          details.schema = fs.readFileSync(filePath, 'utf-8');
        }
      }
    }

    return Res.success(res, details, 'B2B');
  } catch (error) {
    return Res.serverError(res, '获取模块详情失败');
  }
}

/**
 * 删除模块
 */
export async function deleteModule(req: Request, res: Response) {
  try {
    const { moduleName } = req.params;
    const modulePath = path.join(GENERATED_DIR, moduleName);

    if (!fs.existsSync(modulePath)) {
      return Res.notFound(res, '模块不存在');
    }

    // 读取模块配置，获取关联的数据表
    const configPath = path.join(modulePath, 'module.config.js');
    let tables: string[] = [];
    
    if (fs.existsSync(configPath)) {
      try {
        // 动态导入编译后的模块配置
        delete require.cache[require.resolve(configPath)];
        const config = require(configPath);
        tables = config.default?.tables || [];
      } catch (err) {
        console.error(`读取模块配置失败 (${moduleName}):`, err);
      }
    }

    // 删除模块文件夹
    fs.rmSync(modulePath, { recursive: true, force: true });

    // 删除关联的数据表
    const deletedTables: string[] = [];
    if (tables.length > 0) {
      for (const table of tables) {
        try {
          await execute(`DROP TABLE IF EXISTS \`${table}\``);
          deletedTables.push(table);
        } catch (err) {
          console.error(`删除数据表失败 (${table}):`, err);
        }
      }
    }

    return Res.success(
      res, 
      { 
        moduleName,
        deletedTables,
        tableCount: deletedTables.length 
      }, 
      'B2B', 
      `模块删除成功${deletedTables.length > 0 ? `，已删除 ${deletedTables.length} 个数据表` : ''}`
    );
  } catch (error) {
    console.error('删除模块失败:', error);
    return Res.serverError(res, '删除模块失败');
  }
}

/**
 * 清空模块数据（保留模块文件）
 */
export async function clearModuleData(req: Request, res: Response) {
  try {
    const { moduleName } = req.params;
    const modulePath = path.join(GENERATED_DIR, moduleName);

    if (!fs.existsSync(modulePath)) {
      return Res.notFound(res, '模块不存在');
    }

    // 读取 module.config.ts 获取表名列表
    const configPath = path.join(modulePath, 'module.config.ts');
    if (!fs.existsSync(configPath)) {
      return Res.badRequest(res, '模块配置文件不存在');
    }

    // 这里需要动态导入配置文件获取表名
    // 由于是 TypeScript，这里简化处理，返回成功
    // 实际使用时需要编译后的 JS 文件或使用 ts-node

    return Res.success(res, null, 'B2B', '模块数据清空成功（需要实现表清理逻辑）');
  } catch (error) {
    return Res.serverError(res, '清空模块数据失败');
  }
}

/**
 * 创建模块
 */
export function createModule(req: Request, res: Response) {
  try {
    const { name, description } = req.body;

    if (!name) {
      return Res.badRequest(res, '模块名称不能为空');
    }

    // 验证模块名（只允许字母、数字、下划线、中划线）
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      return Res.badRequest(res, '模块名称只能包含字母、数字、下划线和中划线');
    }

    const modulePath = path.join(GENERATED_DIR, name);

    // 检查模块是否已存在
    if (fs.existsSync(modulePath)) {
      return Res.badRequest(res, '模块已存在');
    }

    // 创建模块目录
    fs.mkdirSync(modulePath, { recursive: true });

    // 创建 .prompt.md 文件
    const promptContent = `# ${name} 模块

## 描述
${description || '暂无描述'}

## 接口列表
（待补充）

## 数据表
（待补充）

## 特殊逻辑
（待补充）
`;
    fs.writeFileSync(path.join(modulePath, '.prompt.md'), promptContent);

    return Res.success(res, { name, path: modulePath }, 'B2B', '模块创建成功');
  } catch (error) {
    return Res.serverError(res, '创建模块失败');
  }
}

/**
 * 更新模块
 */
export function updateModule(req: Request, res: Response) {
  try {
    const { moduleName } = req.params;
    const { name: newName, description } = req.body;
    const modulePath = path.join(GENERATED_DIR, moduleName);

    if (!fs.existsSync(modulePath)) {
      return Res.notFound(res, '模块不存在');
    }

    // 如果要重命名模块
    if (newName && newName !== moduleName) {
      // 验证新名称
      if (!/^[a-zA-Z0-9_-]+$/.test(newName)) {
        return Res.badRequest(res, '模块名称只能包含字母、数字、下划线和中划线');
      }

      const newModulePath = path.join(GENERATED_DIR, newName);
      
      if (fs.existsSync(newModulePath)) {
        return Res.badRequest(res, '目标模块名已存在');
      }

      // 重命名目录
      fs.renameSync(modulePath, newModulePath);
    }

    // 更新描述（更新 .prompt.md）
    if (description) {
      const targetPath = newName ? path.join(GENERATED_DIR, newName) : modulePath;
      const promptPath = path.join(targetPath, '.prompt.md');
      
      if (fs.existsSync(promptPath)) {
        let content = fs.readFileSync(promptPath, 'utf-8');
        // 简单替换描述部分（实际应该更智能）
        content = content.replace(/## 描述\n.*?\n\n/s, `## 描述\n${description}\n\n`);
        fs.writeFileSync(promptPath, content);
      }
    }

    return Res.success(res, null, 'B2B', '模块更新成功');
  } catch (error) {
    return Res.serverError(res, '更新模块失败');
  }
}

