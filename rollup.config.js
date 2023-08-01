const pkg = require("./package.json");
const typescript = require("@rollup/plugin-typescript");
const commonjs = require("@rollup/plugin-commonjs");
const json = require("@rollup/plugin-json");
const builtins = require("builtin-modules");
const terser = require("@rollup/plugin-terser");

exports.default = {
	input: "src/index.ts",
	output: [
		{
			file: "dist/index.js",
			format: "cjs",
		},
	],
	plugins: [typescript(), commonjs(), json(), terser()],
	external: [...builtins, ...Object.keys(pkg.dependencies || {})],
};