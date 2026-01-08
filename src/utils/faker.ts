import { faker } from '@faker-js/faker/locale/zh_CN';

// 导出中文版 faker
export { faker };

/**
 * 智能字段值生成器
 * 根据字段名和类型自动推断并生成合适的数据
 */
export class SmartFieldGenerator {
  /**
   * 根据字段名生成值
   * @param fieldName 字段名
   * @param fieldType 字段类型
   * @param uniqueIndex 当前生成的索引，用于保证唯一性
   */
  static generateByFieldName(fieldName: string, fieldType: string, uniqueIndex: number = 0): any {
    const lowerName = fieldName.toLowerCase();

    // 订单号 - 保证唯一性
    if (lowerName.includes('order_no') || lowerName.includes('orderno')) {
      return `ORD${Date.now()}${String(uniqueIndex).padStart(5, '0')}`;
    }

    // 发票号 - 保证唯一性
    if (lowerName.includes('invoice_no') || lowerName.includes('invoiceno')) {
      return `INV${Date.now()}${String(uniqueIndex).padStart(5, '0')}`;
    }

    // 单据号/编号 - 保证唯一性
    if ((lowerName.includes('_no') || lowerName.includes('_code')) && 
        !lowerName.includes('phone') && !lowerName.includes('tel')) {
      return `NO${Date.now()}${String(uniqueIndex).padStart(5, '0')}`;
    }

    // 姓名相关
    if (lowerName.includes('name') || lowerName.includes('username')) {
      return faker.person.fullName();
    }

    // 邮箱 - 保证唯一性
    if (lowerName.includes('email')) {
      return `user${uniqueIndex}_${Date.now()}@example.com`;
    }

    // 手机号 - 保证唯一性
    if (lowerName.includes('phone') || lowerName.includes('mobile') || lowerName.includes('tel')) {
      const basePhone = 13000000000 + uniqueIndex;
      return String(basePhone).substring(0, 11);
    }

    // 地址
    if (lowerName.includes('address')) {
      return faker.location.streetAddress();
    }

    // 城市
    if (lowerName.includes('city')) {
      return faker.location.city();
    }

    // 省份
    if (lowerName.includes('province') || lowerName.includes('state')) {
      return faker.location.state();
    }

    // 邮编
    if (lowerName.includes('postcode') || lowerName.includes('zipcode')) {
      return faker.location.zipCode();
    }

    // 公司
    if (lowerName.includes('company')) {
      return faker.company.name();
    }

    // URL
    if (lowerName.includes('url') || lowerName.includes('website')) {
      return faker.internet.url();
    }

    // 图片
    if (lowerName.includes('image') || lowerName.includes('avatar') || lowerName.includes('photo')) {
      return faker.image.avatar();
    }

    // 标题
    if (lowerName.includes('title')) {
      return faker.lorem.sentence({ min: 3, max: 8 });
    }

    // 描述/内容
    if (lowerName.includes('description') || lowerName.includes('content') || lowerName.includes('remark')) {
      return faker.lorem.paragraph();
    }

    // 价格/金额
    if (lowerName.includes('price') || lowerName.includes('amount') || lowerName.includes('money')) {
      return faker.number.float({ min: 1, max: 10000, multipleOf: 0.01 });
    }

    // 数量/库存
    if (lowerName.includes('quantity') || lowerName.includes('count') || lowerName.includes('num') || lowerName.includes('stock')) {
      return faker.number.int({ min: 1, max: 1000 });
    }

    // ID字段（外键）- 生成较小的值
    if (lowerName.includes('_id') || lowerName.includes('id_')) {
      return faker.number.int({ min: 1, max: 10 });
    }

    // 状态
    if (lowerName.includes('status')) {
      return faker.number.int({ min: 0, max: 1 });
    }

    // 排序
    if (lowerName.includes('sort') || lowerName.includes('order')) {
      return faker.number.int({ min: 0, max: 100 });
    }

    // 日期时间
    if (lowerName.includes('date') || lowerName.includes('time') || lowerName.includes('at')) {
      return faker.date.recent({ days: 30 });
    }

    // 根据类型生成
    return this.generateByFieldType(fieldType);
  }

  /**
   * 根据字段类型生成值
   */
  static generateByFieldType(fieldType: string): any {
    const lowerType = fieldType.toLowerCase();

    if (lowerType.includes('int') || lowerType.includes('integer')) {
      return faker.number.int({ min: 1, max: 100 });
    }

    if (lowerType.includes('decimal') || lowerType.includes('float') || lowerType.includes('double')) {
      return faker.number.float({ min: 1, max: 10000, multipleOf: 0.01 });
    }

    if (lowerType.includes('bool') || lowerType.includes('boolean')) {
      return faker.datatype.boolean();
    }

    if (lowerType.includes('date')) {
      return faker.date.recent({ days: 30 });
    }

    if (lowerType.includes('text')) {
      return faker.lorem.paragraph();
    }

    // 默认字符串
    return faker.lorem.words(3);
  }

  /**
   * 批量生成数据
   * @param fields 字段列表
   * @param count 生成数量
   */
  static generateBatch(fields: Array<{ name: string; type: string }>, count: number): any[] {
    const result = [];
    for (let i = 0; i < count; i++) {
      const row: any = {};
      for (const field of fields) {
        // 传入索引以保证唯一性
        row[field.name] = this.generateByFieldName(field.name, field.type, i);
      }
      result.push(row);
    }
    return result;
  }
}

/**
 * 数据模板库
 */
export const DataTemplates = {
  // 用户模板
  user: () => ({
    username: faker.internet.userName(),
    password: faker.internet.password(),
    email: faker.internet.email(),
    phone: faker.phone.number('1##########'),
    real_name: faker.person.fullName(),
    avatar: faker.image.avatar(),
    gender: faker.number.int({ min: 0, max: 2 }),
    birthday: faker.date.birthdate(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    province: faker.location.state(),
    status: 1,
    created_at: faker.date.recent({ days: 180 }),
  }),

  // 订单模板
  order: () => ({
    order_no: 'ORD' + Date.now() + faker.number.int({ min: 1000, max: 9999 }),
    user_id: faker.number.int({ min: 1, max: 1000 }),
    total_amount: faker.number.float({ min: 10, max: 5000, precision: 0.01 }),
    status: faker.number.int({ min: 0, max: 5 }),
    payment_method: faker.helpers.arrayElement(['alipay', 'wechat', 'bank']),
    payment_time: faker.date.recent({ days: 30 }),
    remark: faker.lorem.sentence(),
    created_at: faker.date.recent({ days: 90 }),
  }),

  // 商品模板
  product: () => ({
    name: faker.commerce.productName(),
    category: faker.commerce.department(),
    price: faker.number.float({ min: 10, max: 9999, precision: 0.01 }),
    stock: faker.number.int({ min: 0, max: 1000 }),
    description: faker.commerce.productDescription(),
    image: faker.image.url(),
    status: 1,
    created_at: faker.date.recent({ days: 365 }),
  }),

  // 发票模板
  invoice: () => ({
    invoice_no: 'INV' + Date.now() + faker.number.int({ min: 1000, max: 9999 }),
    order_id: faker.number.int({ min: 1, max: 10000 }),
    amount: faker.number.float({ min: 100, max: 50000, precision: 0.01 }),
    type: faker.number.int({ min: 1, max: 2 }),
    status: faker.number.int({ min: 0, max: 4 }),
    title: faker.company.name(),
    tax_no: faker.string.alphanumeric(18).toUpperCase(),
    issue_date: faker.date.recent({ days: 60 }),
    created_at: faker.date.recent({ days: 90 }),
  }),
};

