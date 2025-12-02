import { useState, useCallback, useMemo } from 'react';
import { CardItem, CalculatedTotals, TransactionType } from '@/types/calculator';
import { supabase } from '@/lib/supabase';

export const useCalculator = () => {
  const [items, setItems] = useState<CardItem[]>([]);
  const [tradePercent, setTradePercent] = useState<number>(90);
  const [cashPercent, setCashPercent] = useState<number>(80);

  const addItem = useCallback((cardName?: string, price?: number) => {
    const newItem: CardItem = {
      id: Date.now().toString(),
      price: price || 0,
      cardName,
    };
    setItems((prev) => [...prev, newItem]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateItemPrice = useCallback((id: string, price: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, price } : item))
    );
  }, []);

  const updateItemName = useCallback((id: string, cardName: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, cardName } : item))
    );
  }, []);

  const updateItemPercentages = useCallback((id: string, customTradePercent?: number, customCashPercent?: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, customTradePercent, customCashPercent }
          : item
      )
    );
  }, []);

  const updateTradePercent = useCallback((percent: number) => {
    if (percent >= 0 && percent <= 100) {
      setTradePercent(percent);
    }
  }, []);

  const updateCashPercent = useCallback((percent: number) => {
    if (percent >= 0 && percent <= 100) {
      setCashPercent(percent);
    }
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  const totals: CalculatedTotals = useMemo(() => {
    const itemTotal = items.reduce((sum, item) => sum + (item.price || 0), 0);

    const tradeTotal = items.reduce((sum, item) => {
      const itemTradePercent = item.customTradePercent ?? tradePercent;
      return sum + (item.price * (itemTradePercent / 100));
    }, 0);

    const cashTotal = items.reduce((sum, item) => {
      const itemCashPercent = item.customCashPercent ?? cashPercent;
      return sum + (item.price * (itemCashPercent / 100));
    }, 0);

    return {
      itemTotal,
      tradeTotal,
      cashTotal,
    };
  }, [items, tradePercent, cashPercent]);

  const saveTrade = useCallback(async (customerName?: string, transactionType: TransactionType = 'trade', folderId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('User not authenticated');
        return false;
      }

      const { error } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
          customer_name: customerName,
          items: items,
          item_total: totals.itemTotal,
          trade_total: totals.tradeTotal,
          cash_total: totals.cashTotal,
          trade_percent: tradePercent,
          cash_percent: cashPercent,
          transaction_type: transactionType,
          folder_id: folderId || null,
        });

      if (error) throw error;

      setItems([]);

      return true;
    } catch (error) {
      console.error('Error saving trade:', error);
      return false;
    }
  }, [items, totals, tradePercent, cashPercent]);

  return {
    items,
    tradePercent,
    cashPercent,
    totals,
    addItem,
    removeItem,
    updateItemPrice,
    updateItemName,
    updateItemPercentages,
    updateTradePercent,
    updateCashPercent,
    clearAll,
    saveTrade,
  };
};
