import { env } from "../config/env";

const PROVIDERS = {
  chatgpt: {
    WEB_URL: 'https://chatgpt.com',
    NEW_CHAT_BTN_SELECTOR: 'a[data-testid="create-new-chat-button"]',
    PROMPT_INPUT_SELECTOR: '#prompt-textarea',
    COPY_BTN_SELECTOR: 'button[data-testid="copy-turn-action-button"]',
    LOGIN_BTN_SELECTOR: 'div[data-testid="accounts-profile-button"]',
    VOICE_BTN_SELECTOR: 'button[aria-label="Start Voice"]',
    SEND_BTN_SELECTOR: 'button[data-testid="send-button"]',
    TOOLS_BTN_SELECTOR: 'button[data-testid="composer-plus-btn"]',
    IMAGE_BTN_SELECTOR: '//div[@role="menuitemradio" and .//div[contains(text(), "Create image")]]',
    DOWNLOAD_BTN_SELECTOR: 'button[aria-label="Download this image"]',
    VIOLATION_SELECTOR: 'div[data-message-author-role="assistant"]', 
    VIOLATION_KEYWORDS: [
      "violate",
      "content policy",
      "guidelines",
      "unable to generate",
      "safety system",
      "guardrails",
      "abuse prevention"
    ],
    EXPIRED_MODAL_SELECTOR: '[data-testid="modal-expired-session"]',
    MULTIGEN_SELECTOR: 'div[data-testid="image-paragen-multigen"]',
    NO_AUTH_LOGIN_MODAL_SELECTOR: 'div[data-testid="modal-no-auth-login"]',
    LOGIN_BUTTON_SELECTOR: 'button[data-testid="login-button"]',
  }
};

type ProviderKey = keyof typeof PROVIDERS;
const SELECTED_PROVIDER = env.AI_PROVIDER as ProviderKey;

export const SCRAPER_CONFIG = PROVIDERS[SELECTED_PROVIDER] || PROVIDERS.chatgpt;