import { Request, Response } from 'express';
import { Res } from '../core/Response';
import { ExampleModel } from './model';
import { ExampleCreateDto, ExampleUpdateDto, ExampleListQuery } from './types';
import { moduleConfig } from './module.config';

const model = new ExampleModel();

/**
 * 获取列表
 */
export async function getList(req: Request, res: Response) {
  try {
    const query: ExampleListQuery = {
      page: parseInt(req.query.page as string) || 1,
      pageSize: parseInt(req.query.pageSize as string) || 20,
      status: req.query.status ? parseInt(req.query.status as string) : undefined,
      keyword: req.query.keyword as string,
    };

    const result = await model.findList(query);

    return Res.paginated(
      res,
      result.list,
      result.total,
      result.page,
      result.pageSize,
      moduleConfig.responseFormat
    );
  } catch (error) {
    console.error('获取列表失败:', error);
    return Res.serverError(res, '获取列表失败');
  }
}

/**
 * 获取详情
 */
export async function getDetail(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const item = await model.findById(id);

    if (!item) {
      return Res.notFound(res, '记录不存在');
    }

    return Res.success(res, item, moduleConfig.responseFormat);
  } catch (error) {
    console.error('获取详情失败:', error);
    return Res.serverError(res, '获取详情失败');
  }
}

/**
 * 创建记录
 */
export async function create(req: Request, res: Response) {
  try {
    const data: ExampleCreateDto = req.body;

    // 数据验证
    if (!data.name) {
      return Res.badRequest(res, '名称不能为空');
    }

    // 创建记录
    const id = await model.create({
      ...data,
      status: data.status ?? 1,
      sort_order: data.sort_order ?? 0,
    });

    return Res.success(res, { id }, moduleConfig.responseFormat, '创建成功');
  } catch (error) {
    console.error('创建失败:', error);
    return Res.serverError(res, '创建失败');
  }
}

/**
 * 更新记录
 */
export async function update(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data: ExampleUpdateDto = req.body;

    // 检查记录是否存在
    const exists = await model.exists({ id: parseInt(id) } as any);
    if (!exists) {
      return Res.notFound(res, '记录不存在');
    }

    // 更新记录
    await model.update(parseInt(id), data);

    return Res.success(res, null, moduleConfig.responseFormat, '更新成功');
  } catch (error) {
    console.error('更新失败:', error);
    return Res.serverError(res, '更新失败');
  }
}

/**
 * 删除记录
 */
export async function deleteItem(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // 检查记录是否存在
    const exists = await model.exists({ id: parseInt(id) } as any);
    if (!exists) {
      return Res.notFound(res, '记录不存在');
    }

    // 删除记录
    await model.delete(parseInt(id));

    return Res.success(res, null, moduleConfig.responseFormat, '删除成功');
  } catch (error) {
    console.error('删除失败:', error);
    return Res.serverError(res, '删除失败');
  }
}

