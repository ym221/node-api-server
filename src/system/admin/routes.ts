import { Router } from 'express';
import { asyncHandler } from '../../core/ErrorHandler';

// 健康检查
import { healthCheck } from '../health';

// 模块管理
import {
  getModules,
  getModuleDetail,
  createModule,
  updateModule,
  deleteModule,
  clearModuleData,
} from './modules';

// 数据表管理
import {
  getTables,
  getTableStructure,
  getTableData,
  getTableRow,
  createTableRow,
  updateTableRow,
  deleteTableRow,
  batchDeleteTableRows,
  generateTableData,
  truncateTable,
} from './tables';

// 接口管理
import {
  getInterfaces,
  getInterface,
  setInterface,
  batchSetInterfaces,
  deleteInterface,
  resetInterfaces,
  toggleFavorite,
  batchSetScenario,
  batchResetInterfaces,
} from './interfaces';

// 日志管理已删除

// 场景管理
import {
  getScenarios,
  getScenario,
  applyScenario,
  applyScenarioToInterface,
  createScenario,
  updateScenario,
  deleteScenario,
  saveCurrentAsScenario,
} from './scenarios';

// 路由重载
import { reloadRoutes } from './reload';

const router = Router();

// ===== 健康检查 =====
router.get('/health', asyncHandler(healthCheck));

// ===== 模块管理 =====
router.get('/modules', asyncHandler(getModules));
router.get('/modules/:moduleName', asyncHandler(getModuleDetail));
router.post('/modules', asyncHandler(createModule));
router.put('/modules/:moduleName', asyncHandler(updateModule));
router.delete('/modules/:moduleName', asyncHandler(deleteModule));
router.post('/modules/:moduleName/clear', asyncHandler(clearModuleData));

// ===== 数据表管理 =====
router.get('/tables', asyncHandler(getTables));
router.get('/tables/:tableName/structure', asyncHandler(getTableStructure));
router.get('/tables/:tableName/data', asyncHandler(getTableData));
router.get('/tables/:tableName/data/:id', asyncHandler(getTableRow));
router.post('/tables/:tableName/data', asyncHandler(createTableRow));
router.put('/tables/:tableName/data/:id', asyncHandler(updateTableRow));
router.delete('/tables/:tableName/data/:id', asyncHandler(deleteTableRow));
router.post('/tables/:tableName/batch-delete', asyncHandler(batchDeleteTableRows));
router.post('/tables/:tableName/generate', asyncHandler(generateTableData));
router.post('/tables/:tableName/truncate', asyncHandler(truncateTable));

// ===== 接口管理 =====
router.get('/interfaces', asyncHandler(getInterfaces));
router.get('/interfaces/:method/:path', asyncHandler(getInterface));
router.post('/interfaces', asyncHandler(setInterface));
router.post('/interfaces/batch', asyncHandler(batchSetInterfaces));
router.delete('/interfaces/:method/:path', asyncHandler(deleteInterface));
router.post('/interfaces/reset', asyncHandler(resetInterfaces));
router.post('/interfaces/favorite', asyncHandler(toggleFavorite));
router.post('/interfaces/batch-scenario', asyncHandler(batchSetScenario));
router.post('/interfaces/batch-reset', asyncHandler(batchResetInterfaces));

// ===== 日志管理已删除 =====

// ===== 场景管理 =====
router.get('/scenarios', asyncHandler(getScenarios));
router.get('/scenarios/:scenarioId', asyncHandler(getScenario));
router.post('/scenarios/apply', asyncHandler(applyScenario));
router.post('/scenarios/apply-to-interface', asyncHandler(applyScenarioToInterface));
router.post('/scenarios', asyncHandler(createScenario));
router.put('/scenarios/:scenarioId', asyncHandler(updateScenario));
router.delete('/scenarios/:scenarioId', asyncHandler(deleteScenario));
router.post('/scenarios/save-current', asyncHandler(saveCurrentAsScenario));

// ===== 路由重载 =====
router.post('/reload-routes', asyncHandler(reloadRoutes));

export default router;

