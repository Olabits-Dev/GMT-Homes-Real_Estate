/**
 * Olabits AI Bot Widget Configuration
 * 
 * Script tag for reference:
 * <script src="https://olabitsaibot.vercel.app/widget.js" data-public-key="pk_live_37f991b8ae92faec9cbf3cffa8784943" data-api-base="https://olabitsaibot.vercel.app" defer></script>
 */

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
