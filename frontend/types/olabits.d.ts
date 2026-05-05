declare global {
  interface RealEstateBotConfig {
    publicKey?: string;
    apiKey?: string; // legacy support
    apiBaseUrl?: string;
    mountId?: string;
  }

  interface Window {
    OlabitsWidgetConfig?: {
      publicKey?: string;
      apiKey?: string; // legacy support
      apiBaseUrl?: string;
      mountId?: string;
    };
    RealEstateBotConfig?: RealEstateBotConfig; // legacy support
  }
}

export {};
