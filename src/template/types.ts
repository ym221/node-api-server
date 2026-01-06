/**
 * 类型定义
 */

export interface ExampleItem {
  id: number;
  name: string;
  description?: string;
  status: number;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface ExampleListQuery {
  page?: number;
  pageSize?: number;
  status?: number;
  keyword?: string;
}

export interface ExampleCreateDto {
  name: string;
  description?: string;
  status?: number;
  sort_order?: number;
}

export interface ExampleUpdateDto {
  name?: string;
  description?: string;
  status?: number;
  sort_order?: number;
}

