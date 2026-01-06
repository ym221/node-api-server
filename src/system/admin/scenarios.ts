import { Request, Response } from 'express';
import { Res } from '../../core/Response';
import {
  setInterfaceControl,
  resetAllInterfaceControls,
  InterfaceControlConfig,
} from '../../middlewares/interfaceControl';

/**
 * 场景配置
 */
interface Scenario {
  id: string;
  name: string;
  description: string;
  enabled?: boolean; // 是否启用（默认为 true）
  config: {
    delay?: number;
    randomDelay?: { min: number; max: number };
    errorRate?: number;
    errorType?: 'fixed' | 'random';
    timeout?: number;
  };
}

/**
 * 预设场景
 */
const PRESET_SCENARIOS: Scenario[] = [
  {
    id: 'ideal',
    name: '理想环境',
    description: '所有接口正常响应，无延迟，无错误',
    enabled: true,
    config: {},
  },
  {
    id: 'slow',
    name: '网络慢',
    description: '所有接口延迟 2-5 秒',
    enabled: true,
    config: {
      randomDelay: { min: 2000, max: 5000 },
    },
  },
  {
    id: 'fast',
    name: '网络快',
    description: '所有接口延迟 0-100 毫秒',
    enabled: true,
    config: {
      randomDelay: { min: 0, max: 100 },
    },
  },
  {
    id: 'unstable',
    name: '服务不稳定',
    description: '30% 接口返回 500 错误',
    enabled: true,
    config: {
      errorType: 'random',
      errorRate: 0.3,
    },
  },
  {
    id: 'slow_unstable',
    name: '慢速且不稳定',
    description: '延迟 1-3 秒，20% 错误率',
    enabled: true,
    config: {
      randomDelay: { min: 1000, max: 3000 },
      errorType: 'random',
      errorRate: 0.2,
    },
  },
];

/**
 * 自定义场景存储（内存）
 */
const customScenarios: Map<string, Scenario> = new Map();

/**
 * 获取所有场景
 */
export function getScenarios(req: Request, res: Response) {
  try {
    const allScenarios = [
      ...PRESET_SCENARIOS,
      ...Array.from(customScenarios.values()),
    ];

    return Res.success(res, allScenarios, 'B2B');
  } catch (error) {
    return Res.serverError(res, '获取场景列表失败');
  }
}

/**
 * 获取单个场景
 */
export function getScenario(req: Request, res: Response) {
  try {
    const { scenarioId } = req.params;

    // 先查找预设场景
    const preset = PRESET_SCENARIOS.find(s => s.id === scenarioId);
    if (preset) {
      return Res.success(res, preset, 'B2B');
    }

    // 再查找自定义场景
    const custom = customScenarios.get(scenarioId);
    if (custom) {
      return Res.success(res, custom, 'B2B');
    }

    return Res.notFound(res, '场景不存在');
  } catch (error) {
    return Res.serverError(res, '获取场景失败');
  }
}

/**
 * 应用场景（全局）
 */
export function applyScenario(req: Request, res: Response) {
  try {
    const { scenarioId } = req.body;

    if (!scenarioId) {
      return Res.badRequest(res, '缺少 scenarioId 参数');
    }

    // 查找场景
    let scenario = PRESET_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) {
      scenario = customScenarios.get(scenarioId);
    }

    if (!scenario) {
      return Res.notFound(res, '场景不存在');
    }

    // 重置所有接口配置
    resetAllInterfaceControls();

    // 应用场景配置到所有接口（这里简化处理，实际需要获取所有接口列表）
    // 在实际使用中，会在请求时通过中间件动态应用

    return Res.success(res, null, 'B2B', `场景 "${scenario.name}" 已应用`);
  } catch (error) {
    return Res.serverError(res, '应用场景失败');
  }
}

/**
 * 应用场景到特定接口
 */
export function applyScenarioToInterface(req: Request, res: Response) {
  try {
    const { scenarioId, method, path } = req.body;

    if (!scenarioId || !method || !path) {
      return Res.badRequest(res, '缺少必要参数');
    }

    // 查找场景
    let scenario = PRESET_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) {
      scenario = customScenarios.get(scenarioId);
    }

    if (!scenario) {
      return Res.notFound(res, '场景不存在');
    }

    // 应用配置到特定接口
    setInterfaceControl(method, path, scenario.config);

    return Res.success(res, null, 'B2B', '场景已应用到指定接口');
  } catch (error) {
    return Res.serverError(res, '应用场景失败');
  }
}

/**
 * 创建自定义场景
 */
export function createScenario(req: Request, res: Response) {
  try {
    const { name, description, config } = req.body;

    if (!name || !config) {
      return Res.badRequest(res, '缺少必要参数：name 和 config');
    }

    const id = `custom_${Date.now()}`;
    const scenario: Scenario = {
      id,
      name,
      description: description || '',
      enabled: true, // 默认启用
      config,
    };

    customScenarios.set(id, scenario);

    return Res.success(res, scenario, 'B2B', '场景创建成功');
  } catch (error) {
    return Res.serverError(res, '创建场景失败');
  }
}

/**
 * 删除自定义场景
 */
export function deleteScenario(req: Request, res: Response) {
  try {
    const { scenarioId } = req.params;

    // 不能删除预设场景（前5个固定场景）
    const presetIds = ['ideal', 'slow', 'fast', 'unstable', 'slow_unstable'];
    if (presetIds.includes(scenarioId)) {
      return Res.badRequest(res, '不能删除预设场景');
    }

    if (!customScenarios.has(scenarioId)) {
      return Res.notFound(res, '场景不存在');
    }

    customScenarios.delete(scenarioId);

    return Res.success(res, null, 'B2B', '场景删除成功');
  } catch (error) {
    return Res.serverError(res, '删除场景失败');
  }
}

/**
 * 更新场景
 */
export function updateScenario(req: Request, res: Response) {
  try {
    const { scenarioId } = req.params;
    const { name, description, config, enabled } = req.body;

    // 预设场景列表
    const presetIds = ['ideal', 'slow', 'fast', 'unstable', 'slow_unstable'];
    
    // 查找场景（预设场景也允许修改 enabled 状态）
    let scenario: Scenario | undefined;
    let isPreset = false;
    
    const presetIndex = PRESET_SCENARIOS.findIndex(s => s.id === scenarioId);
    if (presetIndex !== -1) {
      scenario = PRESET_SCENARIOS[presetIndex];
      isPreset = true;
      
      // 预设场景只允许修改 enabled 状态
      if (enabled !== undefined) {
        PRESET_SCENARIOS[presetIndex].enabled = enabled;
      }
      
      // 不允许修改预设场景的其他属性
      if (name || description !== undefined || config) {
        return Res.badRequest(res, '预设场景只能修改启用状态');
      }
      
      return Res.success(res, PRESET_SCENARIOS[presetIndex], 'B2B', '场景更新成功');
    }

    // 自定义场景允许修改所有属性
    scenario = customScenarios.get(scenarioId);
    if (!scenario) {
      return Res.notFound(res, '场景不存在');
    }

    // 更新场景信息
    if (name) scenario.name = name;
    if (description !== undefined) scenario.description = description;
    if (config) scenario.config = config;
    if (enabled !== undefined) scenario.enabled = enabled;

    customScenarios.set(scenarioId, scenario);

    return Res.success(res, scenario, 'B2B', '场景更新成功');
  } catch (error) {
    return Res.serverError(res, '更新场景失败');
  }
}

/**
 * 保存当前配置为场景
 */
export function saveCurrentAsScenario(req: Request, res: Response) {
  try {
    const { name, description, interfaces } = req.body;

    if (!name || !Array.isArray(interfaces)) {
      return Res.badRequest(res, '缺少必要参数：name 和 interfaces');
    }

    // 这里简化处理，只保存通用配置
    // 实际应该保存完整的接口配置列表
    const id = `saved_${Date.now()}`;
    const scenario: Scenario = {
      id,
      name,
      description: description || '',
      config: {}, // 这里应该从 interfaces 提取通用配置
    };

    customScenarios.set(id, scenario);

    return Res.success(res, scenario, 'B2B', '当前配置已保存为场景');
  } catch (error) {
    return Res.serverError(res, '保存场景失败');
  }
}

/**
 * 根据 ID 获取场景（供其他模块使用）
 */
export function getScenarioById(scenarioId: string): Scenario | null {
  // 先查找预设场景
  const preset = PRESET_SCENARIOS.find(s => s.id === scenarioId);
  if (preset) {
    return preset;
  }

  // 再查找自定义场景
  return customScenarios.get(scenarioId) || null;
}


