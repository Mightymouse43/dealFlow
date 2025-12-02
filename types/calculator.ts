export interface CardItem {
  id: string;
  price: number;
  customTradePercent?: number;
  customCashPercent?: number;
  cardName?: string;
}

export interface CalculatorState {
  items: CardItem[];
  tradePercent: number;
  cashPercent: number;
}

export interface CalculatedTotals {
  itemTotal: number;
  tradeTotal: number;
  cashTotal: number;
}

export type TransactionType = 'cash' | 'trade';

export interface SavedTrade {
  id: string;
  date: string;
  customerName?: string;
  items: CardItem[];
  totals: CalculatedTotals;
  tradePercent: number;
  cashPercent: number;
  transactionType: TransactionType;
  folderId?: string | null;
}

export interface TradeRecord {
  id: string;
  customer_name?: string;
  items: CardItem[];
  item_total: number;
  trade_total: number;
  cash_total: number;
  trade_percent: number;
  cash_percent: number;
  transaction_type: TransactionType;
  created_at: string;
  folder_id?: string | null;
}

export interface CardData {
  cardName: string;
  updatedAt: string;
  tcgplayer: {
    marketPrice: number;
    latestSalePrice?: number | null;
    latestSaleDate?: string | null;
    lowListingPrice?: number | null;
    url?: string | null;
  };
  ebayGraded?: {
    totalFound?: number | null;
    highestPrice?: number | null;
    lowestPrice?: number | null;
    averagePrice?: number | null;
    recentSales?: Array<{
      price: number;
      date: string;
      title: string;
      url: string;
    }>;
  };
}
