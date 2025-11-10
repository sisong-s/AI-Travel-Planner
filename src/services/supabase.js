import { createClient } from '@supabase/supabase-js';

// 默认配置，用户可以在设置中修改
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 动态更新Supabase客户端
export const updateSupabaseClient = (url, key) => {
  if (url && key) {
    return createClient(url, key);
  }
  return supabase;
};