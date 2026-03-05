// src/types/index.ts

// 1. 用户与信任实体
export interface User {
  id: string;
  username: string;
  avatar: string;
  isStudentVerified: boolean; // EDU 邮箱认证
  trustScore: number;         // 信誉分 (0-5.0)
  college: string;            // 学院
}

// 2. 商品/技能 混合实体
export type ItemType = 'goods' | 'skill' | 'lost-found';

export interface MarketItem {
  id: string;
  type: ItemType;
  title: string;
  price: number;              // 对应 技能则是 "0" 或 估值
  exchangeTarget?: string;    // 技能交换目标，例如 "吉他教学"
  timeDuration?: string;      // 技能时长，例如 "1小时"
  seller: User;
  tags: string[];
  status: 'active' | 'sold';
  location: string;           // 关联地图地点 ID
  aiMatchScore?: number;      // 智能匹配度 (前端展示用)
}

// 3. 地图点实体
export interface MapSpot {
  id: number;
  name: string;
  type: 'trade' | 'lost' | 'facility'; // 交易点 | 失物 | 设施
  coordinates: { x: number; y: number };
}