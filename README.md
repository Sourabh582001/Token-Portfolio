# Token-Portfolio

A React application for tracking cryptocurrency tokens and managing a personal portfolio.

## Built With

- React + TypeScript + Vite
- Redux for state management
- CoinGecko API for cryptocurrency data

## Features

- Track cryptocurrency tokens in a watchlist
- View token prices, price changes, and sparkline charts
- Manage token holdings
- Calculate portfolio value

## Development

This project was created with Vite. Here's how to get started:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
