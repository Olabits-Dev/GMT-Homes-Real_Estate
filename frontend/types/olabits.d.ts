declare global {
  interface Window {
    OlabitsWidgetConfig?: {
      publicKey?: string;
      apiBaseUrl?: string;
      mountId?: string;
    };
  }
}

export {};
