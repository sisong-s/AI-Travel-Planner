// 用户类型
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

// 旅行偏好类型
export interface TravelPreference {
  budget: number;
  duration: number;
  travelers: number;
  interests: string[];
  accommodationType: 'budget' | 'mid-range' | 'luxury';
  transportMode: 'flight' | 'train' | 'car' | 'mixed';
}

// 景点类型
export interface Attraction {
  id: string;
  name: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  rating: number;
  price: number;
  images: string[];
  category: string;
  openHours: string;
  estimatedDuration: number; // 建议游玩时长（小时）
}

// 住宿类型
export interface Accommodation {
  id: string;
  name: string;
  type: 'hotel' | 'hostel' | 'apartment' | 'resort';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  rating: number;
  pricePerNight: number;
  images: string[];
  amenities: string[];
}

// 餐厅类型
export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  rating: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  images: string[];
  specialties: string[];
}

// 行程日程类型
export interface DayItinerary {
  date: string;
  attractions: Attraction[];
  restaurants: Restaurant[];
  accommodation?: Accommodation;
  transportation: string[];
  notes: string;
}

// 旅行计划类型
export interface TravelPlan {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  preferences: TravelPreference;
  itinerary: DayItinerary[];
  createdAt: string;
  updatedAt: string;
}

// 费用记录类型
export interface ExpenseRecord {
  id: string;
  planId: string;
  category: 'accommodation' | 'food' | 'transportation' | 'attraction' | 'shopping' | 'other';
  amount: number;
  description: string;
  date: string;
  location?: string;
}

// 语音输入状态
export interface VoiceInputState {
  isListening: boolean;
  transcript: string;
  error: string | null;
}