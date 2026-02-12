
import Dashboard from "@/components/Dashboard";
import { parseCSVData } from "@/lib/data-utils";

export const revalidate = 600; // Revalidate every 10 minutes

/**
 * Fetches CSV data from the provided URL
 */
async function getAttendanceData() {
  const csvUrl = process.env.CSV_URL;

  if (!csvUrl) {
    console.warn("CSV_URL is not defined. Falling back to empty data.");
    return [];
  }

  try {
    const response = await fetch(csvUrl, { next: { revalidate: 600 } });
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    const csvString = await response.text();
    return parseCSVData(csvString);
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return [];
  }
}

export default async function Page() {
  const initialRecords = await getAttendanceData();

  return (
    <main className="min-h-screen bg-slate-50">
      <Dashboard initialRecords={initialRecords} />
    </main>
  );
}
