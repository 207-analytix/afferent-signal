import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Enforce no raw backend status strings exposed to consumers
      "no-restricted-syntax": [
        "warn",
        {
          selector: "Literal[value='PENDING_MANUAL_TRIAGE']",
          message: "Use getStatusLabel() from status-map.ts — never expose raw statuses to consumers."
        },
        {
          selector: "Literal[value='urgency_score']",
          message: "urgency_score is ops-only. Never render this in consumer-facing components."
        }
      ]
    }
  }
];

export default eslintConfig;
