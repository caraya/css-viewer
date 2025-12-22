# CSS Viewer

A React application that provides a comprehensive view of CSS properties, combining W3C specifications with MDN browser compatibility data.

## Prerequisites

- Node.js (v18+ recommended)
- npm

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

## Data Preparation

Before running the application, you need to generate the data files. This process fetches the latest CSS specifications and browser compatibility data.

```bash
npm run prepare-data
```

This script performs the following steps:

1. Fetches raw data from W3C Webref and MDN.
2. Patches known issues (broken links, missing functions).
3. Filters for browser support (requires support in at least 2 major browsers).
4. Generates `src/data.json`.

## Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:2509`.

## Building for Production

To create a production build:

```bash
npm run build
```

## Automation

This project includes a GitHub Action (`.github/workflows/weekly-data-update.yml`) that automatically runs the data preparation script every Sunday at 00:00 UTC to keep the dataset current.

## Architecture

For a deeper dive into the project structure and data pipeline, please refer to [explainer](EXPLAINER.md).
