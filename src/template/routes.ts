import { Router } from 'express';
import { asyncHandler } from '../core/ErrorHandler';
import * as controller from './controller';

const router = Router();

// 列表
router.get('/example/list', asyncHandler(controller.getList));

// 详情
router.get('/example/:id', asyncHandler(controller.getDetail));

// 创建
router.post('/example', asyncHandler(controller.create));

// 更新
router.put('/example/:id', asyncHandler(controller.update));

// 删除
router.delete('/example/:id', asyncHandler(controller.deleteItem));

export default router;

