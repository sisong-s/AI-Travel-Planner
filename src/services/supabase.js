import { createClient } from '@supabase/supabase-js';

// Supabase 配置
const supabaseUrl = 'https://zojsbwkrzbeqhkvqoatp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvanNid2tyemJlcWhrdnFvYXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMjM2MDYsImV4cCI6MjA3Nzg5OTYwNn0._dz4iIjf1siNgzaTVxo9lIVlbtwbLvas09x-ZS-UPOk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// 动态更新Supabase客户端（保留用于后续扩展）
export const updateSupabaseClient = (url, key) => {
  if (url && key) {
    return createClient(url, key);
  }
  return supabase;
};