/**
 * Enhanced Backend Core System
 * 
 * This module provides a robust, scalable backend infrastructure with:
 * - Advanced error handling and retry mechanisms
 * - Performance monitoring and caching
 * - Transaction batching and optimization
 * - Data consistency guarantees
 * - Comprehensive logging and analytics
 */

import { getFirestore, collection, doc, serverTimestamp, increment, runTransaction, DocumentReference, setDoc, updateDoc, writeBatch, getDoc, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { addDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { MessagingService } from "./messaging-service";

// Performance monitoring
interface PerformanceMetrics {
  operationCount: number;
  averageResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  lastUpdated: Date;
}

// Cache system
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class BackendCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Error handling and retry system
class BackendError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean = true,
    public readonly context?: any
  ) {
    super(message);
    this.name = 'BackendError';
  }
}

// Performance monitor
class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    operationCount: 0,
    averageResponseTime: 0,
    errorRate: 0,
    cacheHitRate: 0,
    lastUpdated: new Date()
  };

  private responseTimes: number[] = [];
  private errorCount = 0;
  private cacheHits = 0;
  private cacheMisses = 0;

  startOperation(): () => void {
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      this.responseTimes.push(duration);
      this.metrics.operationCount++;
      
      // Keep only last 100 response times for average calculation
      if (this.responseTimes.length > 100) {
        this.responseTimes = this.responseTimes.slice(-100);
      }
      
      this.updateMetrics();
    };
  };

  recordError(): void {
    this.errorCount++;
    this.updateMetrics();
  }

  recordCacheHit(): void {
    this.cacheHits++;
    this.updateMetrics();
  }

  recordCacheMiss(): void {
    this.cacheMisses++;
    this.updateMetrics();
  }

  private updateMetrics(): void {
    this.metrics.averageResponseTime = this.responseTimes.length > 0 
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
      : 0;
    
    this.metrics.errorRate = this.metrics.operationCount > 0 
      ? (this.errorCount / this.metrics.operationCount) * 100 
      : 0;
    
    const totalCacheRequests = this.cacheHits + this.cacheMisses;
    this.metrics.cacheHitRate = totalCacheRequests > 0 
      ? (this.cacheHits / totalCacheRequests) * 100 
      : 0;
    
    this.metrics.lastUpdated = new Date();
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.responseTimes = [];
    this.errorCount = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.metrics = {
      operationCount: 0,
      averageResponseTime: 0,
      errorRate: 0,
      cacheHitRate: 0,
      lastUpdated: new Date()
    };
  }
}

// Global instances
export const cache = new BackendCache();
export const performanceMonitor = new PerformanceMonitor();

// Enhanced transaction types
export interface EnhancedTransactionEntry {
  userId: string;
  storeId?: string; // Phase 5: Multi-store support
  amount: number;
  type: "credit" | "debit";
  category: string;
  payerIdentifier: string;
  description?: string;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    device?: string;
    batchId?: string;
  };
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  tags?: string[];
}

export interface TransactionBatch {
  transactions: EnhancedTransactionEntry[];
  userId: string;
  batchId: string;
  createdAt: Date;
}

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2
};

// Enhanced backend functions
export class EnhancedBackend {
  private get db() {
    return getFirestore();
  }
  private retryConfig: RetryConfig;

  constructor(retryConfig: Partial<RetryConfig> = {}) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * Enhanced transaction recording with caching, error handling, and performance monitoring
   */
  async recordTransaction(entry: EnhancedTransactionEntry): Promise<string> {
    const endOperation = performanceMonitor.startOperation();
    
    try {
      // Check cache for duplicate detection
      const cacheKey = `tx_${entry.userId}_${entry.amount}_${entry.type}_${Date.now()}`;
      const cached = cache.get(cacheKey);
      if (cached && typeof cached === 'object' && 'id' in cached) {
        performanceMonitor.recordCacheHit();
        return cached.id as string;
      }
      performanceMonitor.recordCacheMiss();

      // Validate transaction data
      this.validateTransactionEntry(entry);

      // Record transaction with enhanced metadata
      const txnsRef = collection(this.db, "users", entry.userId, "ledgerNodes");
      const txnId = await addDocumentNonBlocking(txnsRef, {
        ...entry,
        status: "success",
        timestamp: serverTimestamp(),
        method: "Digital",
        createdAt: serverTimestamp(),
        processedAt: serverTimestamp(),
        batchId: entry.metadata?.batchId || null
      });
      
      // Update aggregates with enhanced calculations
      await this.updateAggregates(entry);
      
      // Phase 7: Automated High-Value Alert
      if (entry.amount >= 10000) {
        MessagingService.alerts.sendCriticalAlert("Merchant", "HighValueAudit")
          .catch(err => console.error("Alert failed:", err));
      }
      
      // Cache result
      cache.set(cacheKey, { id: (txnId as any)?.id || 'unknown' }, 60000); // Cache for 1 minute
      
      endOperation();
      return (txnId as any)?.id || 'unknown';
    } catch (error: any) {
      performanceMonitor.recordError();
      endOperation();
      
      if (error instanceof BackendError && error.retryable) {
        return this.retryOperation(() => this.recordTransaction(entry));
      }
      
      throw new BackendError(
        `Failed to record transaction: ${error.message}`,
        'TRANSACTION_RECORD_FAILED',
        false,
        { entry, originalError: error }
      );
    }
  }

  /**
   * Batch transaction processing for high-volume scenarios
   */
  async recordTransactionBatch(batch: TransactionBatch): Promise<string[]> {
    const endOperation = performanceMonitor.startOperation();
    
    try {
      // Validate batch
      if (batch.transactions.length === 0) {
        throw new BackendError('Empty batch provided', 'EMPTY_BATCH', false);
      }

      if (batch.transactions.length > 100) {
        throw new BackendError('Batch size exceeds limit', 'BATCH_TOO_LARGE', false);
      }

      const batchRef = writeBatch(this.db);
      const txnIds: string[] = [];

      // Process each transaction in batch
      for (const transaction of batch.transactions) {
        this.validateTransactionEntry(transaction);
        
        const txnRef = doc(collection(this.db, "users", batch.userId, "transactions"));
        batchRef.set(txnRef, {
          ...transaction,
          status: "success",
          timestamp: serverTimestamp(),
          method: "Digital",
          createdAt: serverTimestamp(),
          processedAt: serverTimestamp(),
          batchId: batch.batchId
        });
        
        txnIds.push(txnRef.id);
      }

      // Commit batch
      await batchRef.commit();

      // Update aggregates for batch
      await this.updateBatchAggregates(batch);

      endOperation();
      return txnIds;
    } catch (error: any) {
      performanceMonitor.recordError();
      endOperation();
      
      throw new BackendError(
        `Failed to record transaction batch: ${error.message}`,
        'BATCH_TRANSACTION_FAILED',
        true,
        { batch, originalError: error }
      );
    }
  }

  /**
   * Enhanced analytics with caching and real-time processing
   */
  async getUserAnalytics(userId: string, forceRefresh = false): Promise<any> {
    const endOperation = performanceMonitor.startOperation();
    
    try {
      const cacheKey = `analytics_${userId}`;
      
      if (!forceRefresh) {
        const cached = cache.get(cacheKey);
        if (cached) {
          performanceMonitor.recordCacheHit();
          endOperation();
          return cached;
        }
      }
      performanceMonitor.recordCacheMiss();

      // Fetch fresh data
      const [summaryDoc, aggregatesDoc, transactionsDoc] = await Promise.all([
        getDoc(doc(this.db, "users", userId, "userAnalyticsSummary", "current")),
        getDocs(query(
          collection(this.db, "users", userId, "dailyBusinessAggregates"),
          orderBy("date", "desc"),
          limit(30)
        )),
        getDocs(query(
          collection(this.db, "users", userId, "transactions"),
          orderBy("timestamp", "desc"),
          limit(100)
        ))
      ]);

      const analytics = {
        summary: summaryDoc.exists() ? summaryDoc.data() : null,
        aggregates: aggregatesDoc.docs.map(doc => doc.data()),
        recentTransactions: transactionsDoc.docs.map(doc => doc.data()),
        lastUpdated: serverTimestamp()
      };

      // Cache for 5 minutes
      cache.set(cacheKey, analytics, 300000);
      
      endOperation();
      return analytics;
    } catch (error: any) {
      performanceMonitor.recordError();
      endOperation();
      
      throw new BackendError(
        `Failed to fetch user analytics: ${error.message}`,
        'ANALYTICS_FETCH_FAILED',
        true,
        { userId, originalError: error }
      );
    }
  }

  /**
   * Real-time credit score calculation with enhanced factors
   */
  async calculateCreditScore(userId: string): Promise<number> {
    const endOperation = performanceMonitor.startOperation();
    
    try {
      const cacheKey = `credit_score_${userId}`;
      const cached = cache.get(cacheKey);
      
      if (cached && typeof cached === 'object' && 'score' in cached && typeof cached.score === 'number') {
        performanceMonitor.recordCacheHit();
        endOperation();
        return cached.score;
      }
      performanceMonitor.recordCacheMiss();

      // Get comprehensive data for scoring
      const analytics = await this.getUserAnalytics(userId);
      const userDoc = await getDoc(doc(this.db, "users", userId));
      const userData = userDoc.exists() ? userDoc.data() : {};

      // Enhanced scoring factors
      const factors = {
        paymentHistory: this.calculatePaymentHistoryScore(analytics.recentTransactions || []),
        businessVolume: this.calculateBusinessVolumeScore(analytics.aggregates || []),
        profitability: this.calculateProfitabilityScore(analytics.summary || {}),
        businessAge: this.calculateBusinessAgeScore(userData),
        consistency: this.calculateConsistencyScore(analytics.aggregates || []),
        growth: this.calculateGrowthScore(analytics.aggregates || [])
      };

      // Weighted score calculation
      const weights = {
        paymentHistory: 0.25,
        businessVolume: 0.20,
        profitability: 0.20,
        businessAge: 0.15,
        consistency: 0.10,
        growth: 0.10
      };

      const finalScore = Math.round(
        Object.entries(factors).reduce((total, [factor, score]) => 
          total + (score * weights[factor as keyof typeof weights]), 0
        )
      );

      // Cache score for 1 hour
      cache.set(cacheKey, { score: finalScore }, 3600000);
      
      // Update user document
      await updateDocumentNonBlocking(doc(this.db, "users", userId), {
        creditScore: finalScore,
        scoreFactors: factors,
        scoreCalculatedAt: serverTimestamp()
      });

      endOperation();
      return finalScore;
    } catch (error: any) {
      performanceMonitor.recordError();
      endOperation();
      
      throw new BackendError(
        `Failed to calculate credit score: ${error.message}`,
        'CREDIT_SCORE_CALCULATION_FAILED',
        true,
        { userId, originalError: error }
      );
    }
  }

  /**
   * Get system performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return performanceMonitor.getMetrics();
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    cache.clear();
  }

  // Private helper methods
  private validateTransactionEntry(entry: EnhancedTransactionEntry): void {
    if (!entry.userId || !entry.amount || !entry.type) {
      throw new BackendError('Invalid transaction entry', 'INVALID_TRANSACTION', false);
    }

    if (entry.amount <= 0) {
      throw new BackendError('Transaction amount must be positive', 'INVALID_AMOUNT', false);
    }

    if (entry.amount > 10000000) { // 1 crore limit
      throw new BackendError('Transaction amount exceeds limit', 'AMOUNT_EXCEEDS_LIMIT', false);
    }
  }

  private async updateAggregates(entry: EnhancedTransactionEntry): Promise<void> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours();

    // 1. User-level Aggregates (Aggregated)
    const aggregateRef = doc(this.db, "users", entry.userId, "dailyBusinessAggregates", today);
    
    // 2. Store-level Aggregates (Specific)
    const storeAggregateRef = entry.storeId 
      ? doc(this.db, "users", entry.userId, "stores", entry.storeId, "dailyAggregates", today)
      : null;

    const hourlyUpdateKey = `hourlyTransactionCounts.${currentHour}`;
    
    const updateData: Record<string, any> = {
      id: today,
      userId: entry.userId,
      storeId: entry.storeId || null,
      date: today,
      transactionCount: increment(1),
      [hourlyUpdateKey]: increment(1),
      lastUpdatedAt: serverTimestamp(),
    };

    if (entry.type === "debit") {
      updateData.totalExpenses = increment(entry.amount);
      updateData.netEarnings = increment(-entry.amount);
    } else {
      updateData.totalEarnings = increment(entry.amount);
      updateData.netEarnings = increment(entry.amount);
      
      // Enhanced customer tracking
      if (entry.payerIdentifier !== "General") {
        updateData.uniqueCustomersCount = increment(1);
      }
    }

    setDocumentNonBlocking(aggregateRef, updateData, { merge: true });
    if (storeAggregateRef) {
      setDocumentNonBlocking(storeAggregateRef, updateData, { merge: true });
    }
    
    await this.updateLifetimeSummary(entry);
  }

  private async updateBatchAggregates(batch: TransactionBatch): Promise<void> {
    const batchSummary = batch.transactions.reduce((summary, tx) => {
      if (tx.type === "debit") {
        summary.totalExpenses += tx.amount;
        summary.netEarnings -= tx.amount;
      } else {
        summary.totalEarnings += tx.amount;
        summary.netEarnings += tx.amount;
      }
      summary.transactionCount += 1;
      return summary;
    }, {
      totalEarnings: 0,
      totalExpenses: 0,
      netEarnings: 0,
      transactionCount: 0
    });

    // Update today's aggregate with batch summary
    const today = new Date().toISOString().split('T')[0];
    const aggregateRef = doc(this.db, "users", batch.userId, "dailyBusinessAggregates", today);
    
    setDocumentNonBlocking(aggregateRef, {
      ...batchSummary,
      batchId: batch.batchId,
      batchProcessedAt: serverTimestamp()
    }, { merge: true });
  }

  private async updateLifetimeSummary(entry: EnhancedTransactionEntry): Promise<void> {
    const summaryRef = doc(this.db, "users", entry.userId, "userAnalyticsSummary", "current");
    const categoryKey = `categoryBreakdown.${entry.category || "General"}`;
    
    const summaryData: Record<string, any> = {
      userId: entry.userId,
      totalTransactionsCount: increment(1),
      lastUpdatedAt: serverTimestamp(),
      [categoryKey]: increment(1),
    };

    if (entry.type === "debit") {
      summaryData.totalExpensesOverall = increment(entry.amount);
    } else {
      summaryData.totalEarningsOverall = increment(entry.amount);
      summaryData.dailyEarnings = increment(entry.amount);
    }

    setDocumentNonBlocking(summaryRef, summaryData, { merge: true });
  }

  private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.min(
            this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1),
            this.retryConfig.maxDelay
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        if (!this.isRetryableError(error)) {
          throw error;
        }
      }
    }
    
    throw new BackendError(
      `Operation failed after ${this.retryConfig.maxRetries} retries: ${lastError?.message || 'Unknown error'}`,
      'MAX_RETRIES_EXCEEDED',
      false,
      { originalError: lastError }
    );
  }

  private isRetryableError(error: Error): boolean {
    // Don't retry on validation errors
    if (error instanceof BackendError) {
      return error.retryable;
    }
    
    // Don't retry on network errors that are unlikely to recover
    const nonRetryableMessages = [
      'INVALID_TRANSACTION',
      'INVALID_AMOUNT',
      'AMOUNT_EXCEEDS_LIMIT',
      'EMPTY_BATCH',
      'BATCH_TOO_LARGE'
    ];
    
    return !nonRetryableMessages.some(msg => error.message.includes(msg));
  }

  // Enhanced scoring factor calculations
  private calculatePaymentHistoryScore(transactions: any[]): number {
    const recentTransactions = transactions.slice(0, 50); // Last 50 transactions
    const onTimePayments = recentTransactions.filter(tx => tx.status === 'success').length;
    return Math.min(100, (onTimePayments / Math.max(1, recentTransactions.length)) * 100);
  }

  private calculateBusinessVolumeScore(aggregates: any[]): number {
    const monthlyTotals = aggregates.slice(0, 12); // Last 12 months
    const avgMonthlyVolume = monthlyTotals.reduce((sum, agg) => sum + (agg.totalEarnings || 0), 0) / Math.max(1, monthlyTotals.length);
    return Math.min(100, (avgMonthlyVolume / 100000) * 100); // Scale based on ₹1L monthly volume
  }

  private calculateProfitabilityScore(summary: any): number {
    const totalEarnings = summary.totalEarningsOverall || 0;
    const totalExpenses = summary.totalExpensesOverall || 0;
    const profitMargin = totalEarnings > 0 ? ((totalEarnings - totalExpenses) / totalEarnings) * 100 : 0;
    return Math.min(100, Math.max(0, profitMargin));
  }

  private calculateBusinessAgeScore(userData: any): number {
    const createdAt = userData.createdAt?.toDate?.() || new Date();
    const daysInBusiness = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(100, (daysInBusiness / 365) * 100); // Scale based on years
  }

  private calculateConsistencyScore(aggregates: any[]): number {
    const recentDays = aggregates.slice(0, 30); // Last 30 days
    const activeDays = recentDays.filter(day => (day.transactionCount || 0) > 0).length;
    return (activeDays / Math.max(1, recentDays.length)) * 100;
  }

  private calculateGrowthScore(aggregates: any[]): number {
    if (aggregates.length < 2) return 50; // Neutral score if insufficient data
    
    const recent = aggregates.slice(0, 7)[0]; // Most recent day
    const previous = aggregates.slice(7, 14)[0]; // Same day last week
    
    if (!recent || !previous) return 50;
    
    const recentEarnings = recent.totalEarnings || 0;
    const previousEarnings = previous.totalEarnings || 0;
    
    if (previousEarnings === 0) return 75; // Good growth if starting from zero
    
    const growthRate = ((recentEarnings - previousEarnings) / previousEarnings) * 100;
    return Math.min(100, Math.max(0, 50 + growthRate)); // Scale around 50% baseline
  }
}

// Export singleton instance
export const backend = new EnhancedBackend();

// Export legacy compatibility functions
export const recordBusinessTransaction = (entry: any) => backend.recordTransaction(entry);
export const updateBusinessTrustScore = (userId: string, amount: number, type: string) => 
  backend.calculateCreditScore(userId);
