import { useState, useEffect, useCallback } from 'react';
import { SavedTrade, TradeRecord } from '@/types/calculator';
import { supabase } from '@/lib/supabase';

export const useTradeHistory = () => {
  const [trades, setTrades] = useState<SavedTrade[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrades = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const loadedTrades: SavedTrade[] = (data || []).map((trade: TradeRecord) => ({
        id: trade.id,
        date: trade.created_at,
        customerName: trade.customer_name,
        items: trade.items,
        totals: {
          itemTotal: trade.item_total,
          tradeTotal: trade.trade_total,
          cashTotal: trade.cash_total,
        },
        tradePercent: trade.trade_percent,
        cashPercent: trade.cash_percent,
        transactionType: trade.transaction_type,
        folderId: trade.folder_id,
      }));

      setTrades(loadedTrades);
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTrade = useCallback(async (tradeId: string) => {
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeId);

      if (error) throw error;

      const updatedTrades = trades.filter((trade) => trade.id !== tradeId);
      setTrades(updatedTrades);
      return true;
    } catch (error) {
      console.error('Error deleting trade:', error);
      return false;
    }
  }, [trades]);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  return {
    trades,
    loading,
    loadTrades,
    deleteTrade,
  };
};
