import { supabase, isSupabaseConfigured } from './supabase';
import * as mockData from './mockData';

// This service routes data requests to Supabase if configured, 
// otherwise falls back to the rich mock data for demonstration purposes.

export async function getOutlets() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase!.from('outlets').select('*');
    if (error) throw error;
    return data;
  }
  return mockData.mockOutlets;
}

export async function getOutletPerformances() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase!.from('outlet_performance').select('*');
    if (error) throw error;
    return data;
  }
  return mockData.mockPerformances;
}

export async function getInsights() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase!.from('agent_insights').select('*');
    if (error) throw error;
    return data;
  }
  return mockData.mockInsights;
}

export async function getRecommendations() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase!.from('recommendations').select('*');
    if (error) throw error;
    return data;
  }
  return mockData.mockRecommendations;
}

export async function getAlerts() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase!.from('alerts').select('*');
    if (error) throw error;
    return data;
  }
  return mockData.mockAlerts;
}

export async function getAgentRuns() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase!.from('agent_runs').select('*');
    if (error) throw error;
    return data;
  }
  return mockData.mockAgentRuns;
}
