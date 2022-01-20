import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import css from "rollup-plugin-import-css";
import postcss from "rollup-plugin-postcss";
import babel from '@rollup/plugin-babel';

const packageJson = require("./package.json");

const rollupPlugins = [
    babel({
        babelrc: false,
        exclude: 'node_modules/**',
        babelHelpers: 'bundled',
    }),
    commonjs(),
    postcss(),
    css(),
];

const rollupConfig = {
    input: "index",
    external: [
        /node_modules/
    ],
};

export default [
    {
        ...rollupConfig,
        output: [
            {
              file: packageJson.main + '.js',
              format: "cjs",
              sourcemap: true,
            },
            {
              file: packageJson.module + '.js',
              format: "esm",
              sourcemap: true,
            },
        ],
        plugins: [
            resolve({
                extensions: ['.js']
            }),
            ...rollupPlugins
        ],
    },
    {
        ...rollupConfig,
        output: [
            {
                file: packageJson.main + '.web.js',
                format: "cjs",
                sourcemap: true,
            },
            {
              file: packageJson.module + '.web.js',
              format: "esm",
              sourcemap: true,
            },
        ],
        plugins: [
            resolve({
                extensions: ['.web.js', '.js']
            }),
            ...rollupPlugins
        ],
    },
];