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
      "@typescript-eslint/no-unused-vars": "off", // ⛔ disable unused vars temporarily
      "@typescript-eslint/no-empty-object-type": [
        "error",
        { allowObjectTypes: "always" },
      ],
      "@typescript-eslint/no-explicit-any": "off", // allow any type temporarily
      "@typescript-eslint/no-unused-expressions": "off", // allow unused expressions temporarily
    },
  },
];

export default eslintConfig;
