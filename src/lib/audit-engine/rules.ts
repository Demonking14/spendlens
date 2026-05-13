export type PlanConfig = {
  name: string;
  monthlyPricePerSeat: number;
  annualPricePerSeat?: number;
  maxSeats?: number;
  minSeats?: number;
  features: string[];
};

export type ToolConfig = {
  displayName: string;
  plans: Record<string, PlanConfig>;
};

export const TOOLS_CONFIG: Record<string, ToolConfig> = {
  cursor: {
    displayName: "Cursor",
    plans: {
      hobby: {
        name: "Hobby",
        monthlyPricePerSeat: 0,
        features: ["Limited AI usage", "Basic editor features", "Individual workspace"],
      },
      pro: {
        name: "Pro",
        monthlyPricePerSeat: 20,
        features: ["Extended AI usage", "Frontier models", "Personal productivity features"],
      },
      business: {
        name: "Business",
        monthlyPricePerSeat: 40,
        features: ["Team billing", "Usage analytics", "Admin and privacy controls"],
      },
    },
  },
  github_copilot: {
    displayName: "GitHub Copilot",
    plans: {
      individual: {
        name: "Individual",
        monthlyPricePerSeat: 10,
        features: ["AI code completions", "Chat in supported IDEs", "Individual billing"],
      },
      business: {
        name: "Business",
        monthlyPricePerSeat: 19,
        features: ["Organization policies", "IP indemnity", "Centralized user management"],
      },
      enterprise: {
        name: "Enterprise",
        monthlyPricePerSeat: 39,
        features: ["Enterprise controls", "Knowledge bases", "Advanced GitHub integrations"],
      },
    },
  },
  claude: {
    displayName: "Claude",
    plans: {
      free: {
        name: "Free",
        monthlyPricePerSeat: 0,
        features: ["Limited Claude access", "Basic chat", "Individual usage"],
      },
      pro: {
        name: "Pro",
        monthlyPricePerSeat: 20,
        features: ["Higher usage limits", "Priority access", "Advanced Claude models"],
      },
      max: {
        name: "Max",
        monthlyPricePerSeat: 100,
        features: ["Expanded usage", "Higher output limits", "Priority access"],
      },
      team: {
        name: "Team",
        monthlyPricePerSeat: 30,
        minSeats: 5,
        features: ["Team collaboration", "Admin controls", "Central billing"],
      },
      enterprise: {
        name: "Enterprise",
        monthlyPricePerSeat: 60,
        features: ["Custom contract estimate", "SSO", "Enterprise security controls"],
      },
    },
  },
  chatgpt: {
    displayName: "ChatGPT",
    plans: {
      plus: {
        name: "Plus",
        monthlyPricePerSeat: 20,
        features: ["Expanded ChatGPT limits", "Advanced models", "Individual workspace"],
      },
      team: {
        name: "Team",
        monthlyPricePerSeat: 30,
        minSeats: 2,
        features: ["Shared workspace", "Admin console", "Team billing"],
      },
      enterprise: {
        name: "Enterprise",
        monthlyPricePerSeat: 60,
        features: ["Custom contract estimate", "Enterprise privacy", "Admin and security controls"],
      },
      api: {
        name: "API",
        monthlyPricePerSeat: 0,
        features: ["Usage-based billing", "Developer platform access", "Model API access"],
      },
    },
  },
  anthropic_api: {
    displayName: "Anthropic API",
    plans: {
      usage_based: {
        name: "Usage based",
        monthlyPricePerSeat: 0,
        features: ["Token-based billing", "Console access", "Claude API access"],
      },
    },
  },
  openai_api: {
    displayName: "OpenAI API",
    plans: {
      usage_based: {
        name: "Usage based",
        monthlyPricePerSeat: 0,
        features: ["Token-based billing", "Platform access", "Model API access"],
      },
    },
  },
  gemini: {
    displayName: "Gemini",
    plans: {
      pro: {
        name: "Pro",
        monthlyPricePerSeat: 20,
        features: ["Gemini Advanced access", "Higher limits", "Google AI features"],
      },
      ultra: {
        name: "Ultra",
        monthlyPricePerSeat: 30,
        features: ["Higher usage estimate", "Advanced Google AI access", "Premium limits"],
      },
      api: {
        name: "API",
        monthlyPricePerSeat: 0,
        features: ["Usage-based billing", "Google AI Studio access", "Gemini API access"],
      },
    },
  },
  windsurf: {
    displayName: "Windsurf",
    plans: {
      free: {
        name: "Free",
        monthlyPricePerSeat: 0,
        features: ["Limited AI usage", "Basic Cascade access", "Individual workspace"],
      },
      pro: {
        name: "Pro",
        monthlyPricePerSeat: 15,
        features: ["Expanded prompt credits", "Premium models", "Individual developer features"],
      },
      teams: {
        name: "Teams",
        monthlyPricePerSeat: 35,
        features: ["Team billing", "Admin controls", "Shared usage management"],
      },
    },
  },
};
