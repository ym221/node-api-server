import { Request, Response } from 'express';
import { Res } from '../../core/Response';
import {
  setInterfaceControl,
  getInterfaceControl,
  getAllInterfaceControls,
  clearInterfaceControl,
  resetAllInterfaceControls,
  InterfaceControlConfig,
} from '../../middlewares/interfaceControl';
import { scanModules } from '../../routes/index';

/**
 * 获取所有接口配置
 */
export function getInterfaces(req: Request, res: Response) {
  try {
    // 从模块配置中获取所有接口
    const modules = scanModules();
    const interfaces: any[] = [];

    for (const module of modules) {
      if (module.config && module.config.interfaces) {
        for (const iface of module.config.interfaces) {
          const config = getInterfaceControl(iface.method, iface.path);
          interfaces.push({
            method: iface.method,
            path: iface.path,
            description: iface.description || '',
            module: module.name,
            enabled: config?.disabled !== true,
            scenarioId: config?.scenarioId || null,
            scenarioName: config?.scenarioName || null,
            favorite: config?.favorite || false,
          });
        }
      }
    }

    return Res.success(res, interfaces, 'B2B');
  } catch (error) {
    console.error('获取接口列表失败:', error);
    return Res.serverError(res, '获取接口列表失败');
  }
}

/**
 * 获取单个接口配置
 */
export function getInterface(req: Request, res: Response) {
  try {
    const { method, path } = req.params;
    const config = getInterfaceControl(method, decodeURIComponent(path));

    if (!config) {
      return Res.notFound(res, '接口配置不存在');
    }

    return Res.success(res, config, 'B2B');
  } catch (error) {
    return Res.serverError(res, '获取接口配置失败');
  }
}

/**
 * 设置接口配置
 */
export function setInterface(req: Request, res: Response) {
  try {
    const { method, path, ...config } = req.body;

    if (!method || !path) {
      return Res.badRequest(res, '缺少必要参数：method 和 path');
    }

    setInterfaceControl(method, path, config);

    return Res.success(res, null, 'B2B', '接口配置已更新');
  } catch (error) {
    return Res.serverError(res, '设置接口配置失败');
  }
}

/**
 * 批量设置接口配置
 */
export function batchSetInterfaces(req: Request, res: Response) {
  try {
    const { interfaces } = req.body;

    if (!Array.isArray(interfaces)) {
      return Res.badRequest(res, 'interfaces 必须是数组');
    }

    for (const config of interfaces) {
      const { method, path, ...rest } = config;
      if (method && path) {
        setInterfaceControl(method, path, rest);
      }
    }

    return Res.success(res, null, 'B2B', '批量设置成功');
  } catch (error) {
    return Res.serverError(res, '批量设置失败');
  }
}

/**
 * 删除接口配置
 */
export function deleteInterface(req: Request, res: Response) {
  try {
    const { method, path } = req.params;
    clearInterfaceControl(method, decodeURIComponent(path));

    return Res.success(res, null, 'B2B', '接口配置已删除');
  } catch (error) {
    return Res.serverError(res, '删除接口配置失败');
  }
}

/**
 * 重置所有接口配置
 */
export function resetInterfaces(req: Request, res: Response) {
  try {
    resetAllInterfaceControls();
    return Res.success(res, null, 'B2B', '所有接口配置已重置');
  } catch (error) {
    return Res.serverError(res, '重置接口配置失败');
  }
}

/**
 * 切换接口收藏状态
 */
export function toggleFavorite(req: Request, res: Response) {
  try {
    const { method, path } = req.body;

    if (!method || !path) {
      return Res.badRequest(res, '缺少必要参数：method 和 path');
    }

    const config = getInterfaceControl(method, path);
    const currentFavorite = config?.favorite || false;

    setInterfaceControl(method, path, { favorite: !currentFavorite });

    return Res.success(res, { favorite: !currentFavorite }, 'B2B');
  } catch (error) {
    return Res.serverError(res, '切换收藏状态失败');
  }
}

/**
 * 批量设置接口场景
 */
export function batchSetScenario(req: Request, res: Response) {
  try {
    const { interfaces, scenarioId } = req.body;

    if (!Array.isArray(interfaces) || !scenarioId) {
      return Res.badRequest(res, '参数错误：需要 interfaces 数组和 scenarioId');
    }

    // 获取场景配置
    const { getScenarioById } = require('./scenarios');
    const scenario = getScenarioById(scenarioId);
    
    if (!scenario) {
      return Res.notFound(res, '场景不存在');
    }

    // 批量应用场景配置
    let count = 0;
    for (const iface of interfaces) {
      if (iface.method && iface.path) {
        setInterfaceControl(iface.method, iface.path, {
          ...scenario.config,
          scenarioId,
          scenarioName: scenario.name
        });
        count++;
      }
    }

    return Res.success(res, { count }, 'B2B', `已为 ${count} 个接口应用场景：${scenario.name}`);
  } catch (error) {
    console.error('批量设置场景失败:', error);
    return Res.serverError(res, '批量设置场景失败');
  }
}

/**
 * 批量重置接口配置
 */
export function batchResetInterfaces(req: Request, res: Response) {
  try {
    const { interfaces } = req.body;

    if (!Array.isArray(interfaces)) {
      return Res.badRequest(res, '参数错误：interfaces 必须是数组');
    }

    let count = 0;
    for (const iface of interfaces) {
      if (iface.method && iface.path) {
        clearInterfaceControl(iface.method, iface.path);
        count++;
      }
    }

    return Res.success(res, { count }, 'B2B', `已重置 ${count} 个接口配置`);
  } catch (error) {
    console.error('批量重置失败:', error);
    return Res.serverError(res, '批量重置失败');
  }
}


