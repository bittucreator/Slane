/**
 * @author Shiva Nagendra Babu Kore
 */

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
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Make img tag rule a warning instead of error for deployment
      "@next/next/no-img-element": "warn",
      // Allow unused vars in development
      "@typescript-eslint/no-unused-vars": "warn",
      // Allow any type temporarily
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow missing dependencies in useEffect
      "react-hooks/exhaustive-deps": "warn",
    }
  }
];

export default eslintConfig;
