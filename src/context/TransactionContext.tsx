"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type Transaction = {
  name: string;
  amount: number;
  type: "credit" | "debit";
  time: string;
};

interface TransactionContextType {
  transactions: Transaction[];
  totalEarnings: number;
  merchantsCount: number;
  creditScore: number;
  addTransaction: (transaction: Omit<Transaction, "time">) => void;
  addMerchant: () => void;
  updateCreditScore: (delta: number) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const BASELINE_EARNINGS = 211200;
export const BASELINE_MERCHANTS = 84;
export const BASELINE_CREDIT = 742;

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [merchantsCount, setMerchantsCount] = useState<number>(0);
  const [creditScore, setCreditScore] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTx = localStorage.getItem("sim_transactions");
    const savedEarnings = localStorage.getItem("sim_totalEarnings");
    const savedMerchants = localStorage.getItem("sim_merchantsCount");
    const savedCredit = localStorage.getItem("sim_creditScore");
    
    if (savedTx) setTransactions(JSON.parse(savedTx));
    if (savedEarnings) setTotalEarnings(parseFloat(savedEarnings));
    if (savedMerchants) setMerchantsCount(parseInt(savedMerchants));
    if (savedCredit) setCreditScore(parseInt(savedCredit));
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("sim_transactions", JSON.stringify(transactions));
      localStorage.setItem("sim_totalEarnings", totalEarnings.toString());
      localStorage.setItem("sim_merchantsCount", merchantsCount.toString());
      localStorage.setItem("sim_creditScore", creditScore.toString());
    }
  }, [transactions, totalEarnings, merchantsCount, creditScore, isLoaded]);

  const addTransaction = (newTx: Omit<Transaction, "time">) => {
    const txWithTime: Transaction = {
      ...newTx,
      time: new Date().toLocaleTimeString(),
    };
    setTransactions((prev) => [txWithTime, ...prev]);
    
    // Logic: Inflows boost metrics and credit score
    if (newTx.type === "credit") {
      setTotalEarnings((prev) => prev + newTx.amount);
      setCreditScore(prev => Math.min(900, prev + 2)); // Each sale builds trust
    } else {
      setTotalEarnings((prev) => prev - newTx.amount);
    }
  };

  const addMerchant = () => {
    setMerchantsCount(prev => prev + 1);
    setCreditScore(prev => Math.min(900, prev + 10)); // Network expansion builds credibility
  };

  const updateCreditScore = (delta: number) => {
    setCreditScore(prev => Math.min(900, Math.max(300, prev + delta)));
  };

  return (
    <TransactionContext.Provider value={{ 
      transactions, 
      totalEarnings, 
      merchantsCount, 
      creditScore,
      addTransaction, 
      addMerchant,
      updateCreditScore
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider");
  }
  return context;
}
