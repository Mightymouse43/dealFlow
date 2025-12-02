import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ScanLimitResult {
  canScan: boolean;
  remaining: number;
  isPro: boolean;
}

export const useScanLimit = () => {
  const { user, isPro } = useAuth();
  const [checking, setChecking] = useState(false);

  const checkScanLimit = useCallback(async (): Promise<ScanLimitResult> => {
    if (!user) {
      return { canScan: false, remaining: 0, isPro: false };
    }

    if (isPro) {
      return { canScan: true, remaining: -1, isPro: true };
    }

    setChecking(true);

    try {
      const { data, error } = await supabase.rpc('can_user_scan', {
        user_uuid: user.id,
      });

      if (error) throw error;

      return {
        canScan: data.can_scan,
        remaining: data.remaining,
        isPro: data.is_pro,
      };
    } catch (error) {
      console.error('Error checking scan limit:', error);
      return { canScan: false, remaining: 0, isPro: false };
    } finally {
      setChecking(false);
    }
  }, [user, isPro]);

  const incrementScanCount = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    if (isPro) return true;

    try {
      const { data, error } = await supabase.rpc('increment_scan_count', {
        user_uuid: user.id,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error incrementing scan count:', error);
      return false;
    }
  }, [user, isPro]);

  return {
    checkScanLimit,
    incrementScanCount,
    checking,
  };
};
