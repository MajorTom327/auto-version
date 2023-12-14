import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

const tsConfig = {
  declaration: true,
  declarationDir: "dist",
  exclude: ["**/*.spec.ts"],
  rootDir: "src/",
};

export default [
  // CommonJS
  {
    input: "src/index.ts",
    exclude: ["**/*.spec.ts"],
    output: {
      dir: "./dist",
      entryFileNames: "index.js",
      format: "cjs",
    },
    plugins: [typescript(tsConfig), terser()],
  },
];
