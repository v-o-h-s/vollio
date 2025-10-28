import { useSubscription } from "@/lib/contexts/SubscriptionContext";

export function usePremium() {
  const { isPremium, features, togglePremium } = useSubscription();

  return {
    isPremium,
    features,
    togglePremium,
    // Helper functions for specific features
    canUseAI: features.aiGeneration,
    canUseAdvancedAnalytics: features.advancedAnalytics,
    hasUnlimitedStorage: features.unlimitedStorage,
    hasPrioritySupport: features.prioritySupport,
  };
}