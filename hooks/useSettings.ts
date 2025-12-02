import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserSettings {
  id: string;
  trade_percent: number;
  cash_percent: number;
  created_at: string;
  updated_at: string;
}

const SETTINGS_ID_KEY = '@app_settings_id';

export const useSettings = () => {
  const [tradePercent, setTradePercent] = useState<number>(90);
  const [cashPercent, setCashPercent] = useState<number>(80);
  const [isLoading, setIsLoading] = useState(true);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data && !error) {
        setTradePercent(data.trade_percent);
        setCashPercent(data.cash_percent);
        setSettingsId(data.id);
      } else {
        const { data: newSettings, error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            trade_percent: 90,
            cash_percent: 80,
          })
          .select()
          .single();

        if (newSettings && !insertError) {
          setTradePercent(newSettings.trade_percent);
          setCashPercent(newSettings.cash_percent);
          setSettingsId(newSettings.id);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (newTradePercent: number, newCashPercent: number) => {
    try {
      if (settingsId) {
        const { error } = await supabase
          .from('user_settings')
          .update({
            trade_percent: newTradePercent,
            cash_percent: newCashPercent,
            updated_at: new Date().toISOString(),
          })
          .eq('id', settingsId);

        if (error) throw error;
      } else {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.error('User not authenticated');
          return false;
        }

        const { data, error } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            trade_percent: newTradePercent,
            cash_percent: newCashPercent,
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setSettingsId(data.id);
        }
      }

      setTradePercent(newTradePercent);
      setCashPercent(newCashPercent);

      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }, [settingsId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    tradePercent,
    cashPercent,
    isLoading,
    saveSettings,
    loadSettings,
  };
};
