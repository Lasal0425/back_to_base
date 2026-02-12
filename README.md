
# Attendance Compliance Dashboard

A production-ready attendance monitoring system built with Next.js 14, React, and Shadcn/UI.

## Features
- **Dynamic CSV Integration**: Fetches data from Google Sheets (published as CSV).
- **Metadata Fill-down**: Automatically restores missing employee info in merged-cell exports.
- **Compliance Tracking**:
  - **ATL and Above**: Required 4 days/month.
  - **Below ATL**: Required 2 days/month.
  - **Qualifying Day**: Distinct date where "Back to Base Score" is ≥ 1.
- **Interactive Filters**: Filter by Month, EPF, Supervisor, CoE, Office, and Shift.
- **Visual Analytics**: Compliance distribution by Office and Shift using Recharts.
- **Non-Compliant Watchlist**: Dedicated section for employees missing attendance targets.

## Setup

1. **Environment Variables**:
   Create a `.env.local` file in the root:
   ```env
   CSV_URL=your_published_google_sheets_csv_url_here
   ```

2. **Installation**:
   ```bash
   npm install
   ```

3. **Development**:
   ```bash
   npm run dev
   ```

## Compliance Business Logic

- **Qualifying Day Definition**:
  A day is considered "attended" if there is at least one record for that date where the `Back to Base Score` is numeric and greater than or equal to 1. 
  Non-numeric scores (like "P") or missing scores are treated as 0 by default. This rule can be adjusted in `src/lib/data-utils.ts` in the `parseScore` helper function.

- **Required Days Logic**:
  Managed in `src/lib/data-utils.ts` under `aggregateMonthlyData`. 
  - `Category == "ATL and Above"` -> 4 days.
  - Others -> 2 days.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **Data Tables**: TanStack Table
- **Charts**: Recharts
- **Parsing**: PapaParse
- **Date Handling**: date-fns
