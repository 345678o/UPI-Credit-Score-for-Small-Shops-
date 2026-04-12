"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useUser } from "@/firebase";
import { getMerchantStores, Store } from "@/lib/store-management";

interface StoreContextType {
  stores: Store[];
  selectedStore: Store | null; // 'null' represents 'All Stores'
  setSelectedStore: (store: Store | null) => void;
  isLoading: boolean;
  refreshStores: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStores = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getMerchantStores(user.uid);
      setStores(data);
      
      // PERSISTENCE: Restore selected store from local storage if valid
      const savedStoreId = localStorage.getItem(`selected_store_${user.uid}`);
      if (savedStoreId && savedStoreId !== "all") {
        const restored = data.find(s => s.id === savedStoreId);
        if (restored) setSelectedStore(restored);
      }
    } catch (error) {
      console.error("Failed to load stores", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [user]);

  const handleSetSelectedStore = (store: Store | null) => {
    setSelectedStore(store);
    if (!user) return;
    localStorage.setItem(`selected_store_${user.uid}`, store ? store.id : "all");
  };

  return (
    <StoreContext.Provider value={{ 
      stores, 
      selectedStore, 
      setSelectedStore: handleSetSelectedStore, 
      isLoading,
      refreshStores: fetchStores
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
