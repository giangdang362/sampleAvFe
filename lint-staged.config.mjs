export default {
  "!src/**/*.{js,jsx,ts,tsx}": "prettier --write --cache --ignore-unknown",
  "{src/**/*.{js,jsx,ts,tsx},__parallel_1__}": [
    "eslint --cache --quiet --no-error-on-unmatched-pattern --fix",
    "prettier --write --cache --ignore-unknown",
  ],
  "{src/**/*.{js,jsx,ts,tsx},__parallel_2__}": () =>
    "tsc --skipLibCheck --noEmit",
};
