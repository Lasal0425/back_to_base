
import Papa from 'papaparse';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, isSameDay } from 'date-fns';

export interface RawRecord {
    EPF: string;
    Name: string;
    Category: string;
    Designation: string;
    Supervisor: string;
    CoE: string;
    Office: string;
    Shift: string;
    Date: string;
    'First Punch In': string;
    'Last Punch Out': string;
    Duration: string;
    'Back to Base Score': string;
}

export interface AttendanceRecord {
    epf: string;
    name: string;
    category: string;
    designation: string;
    supervisor: string;
    coe: string;
    office: string;
    shift: string;
    date: string; // YYYY-MM-DD
    firstPunchIn: string | null;
    lastPunchOut: string | null;
    duration: number;
    backToBaseScore: number;
}

export interface EmployeeSummary {
    epf: string;
    name: string;
    category: string;
    designation: string;
    supervisor: string;
    coe: string;
    office: string;
    shift: string;
    totalHours: number;
    qualifyingScore: number;
    requiredScore: number;
    isCompliant: boolean;
    gap: number;
}

export interface DashboardData {
    records: AttendanceRecord[];
    summaries: EmployeeSummary[];
    supervisors: string[];
    coes: string[];
    offices: string[];
    shifts: string[];
}

/**
 * Parses and cleans CSV data
 */
export function parseCSVData(csvString: string): AttendanceRecord[] {
    const result = Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
    });

    const rawRecords = result.data as RawRecord[];
    const epfMetadata: Record<string, Partial<AttendanceRecord>> = {};

    return rawRecords.map((row) => {
        const epf = row.EPF?.trim() || '';

        // Fill-down strategy
        if (epf) {
            const hasMetadata = row.Name || row.Category || row.Designation || row.Supervisor || row.CoE;
            if (hasMetadata) {
                epfMetadata[epf] = {
                    name: row.Name?.trim() || '',
                    category: row.Category?.trim() || '',
                    designation: row.Designation?.trim() || '',
                    supervisor: row.Supervisor?.trim() || '',
                    coe: row.CoE?.trim() || '',
                    office: row.Office?.trim() || '',
                    shift: row.Shift?.trim() || '',
                };
            } else if (epfMetadata[epf]) {
                // Carry forward
                Object.assign(row, {
                    Name: epfMetadata[epf].name,
                    Category: epfMetadata[epf].category,
                    Designation: epfMetadata[epf].designation,
                    Supervisor: epfMetadata[epf].supervisor,
                    CoE: epfMetadata[epf].coe,
                    Office: epfMetadata[epf].office,
                    Shift: epfMetadata[epf].shift,
                });
            }
        }

        return {
            epf,
            name: row.Name?.trim() || 'Unknown',
            category: row.Category?.trim() || 'Below ATL',
            designation: row.Designation?.trim() || '',
            supervisor: row.Supervisor?.trim() || 'Unknown',
            coe: row.CoE?.trim() || 'Unknown',
            office: row.Office?.trim() || 'Other',
            shift: row.Shift?.trim() || 'Unknown',
            date: row.Date || '',
            firstPunchIn: row['First Punch In'] || null,
            lastPunchOut: row['Last Punch Out'] || null,
            duration: parseFloat(row.Duration) || 0,
            backToBaseScore: parseScore(row['Back to Base Score']),
        };
    });
}

/**
 * Helper to parse score. Numeric value >= 1 is qualifying.
 * 'P' or missing is non-qualifying by default.
 */
function parseScore(score: string): number {
    if (!score) return 0;
    const num = parseFloat(score);
    if (isNaN(num)) {
        // Basic implementation: if exactly "P", treat as 0 for now as per requirements
        // but can be changed here.
        return 0;
    }
    return num;
}

/**
 * Aggregates records into summaries per employee across all dates
 */
export function aggregateEmployeeData(records: AttendanceRecord[]): EmployeeSummary[] {
    const groups: Record<string, AttendanceRecord[]> = {};

    records.forEach((rec) => {
        if (!rec.epf) return;
        const key = rec.epf;
        if (!groups[key]) groups[key] = [];
        groups[key].push(rec);
    });

    return Object.values(groups).map((group) => {
        const first = group[0];

        const totalHours = group.reduce((sum, r) => sum + r.duration, 0);

        // Qualifying Score: sum of all scores for this employee
        const qualifyingScore = group.reduce((sum, r) => sum + r.backToBaseScore, 0);

        const requiredScore = first.category === 'ATL and Above' ? 4 : 2;
        const isCompliant = qualifyingScore >= requiredScore;
        const gap = Math.max(0, requiredScore - qualifyingScore);

        return {
            epf: first.epf,
            name: first.name,
            category: first.category,
            designation: first.designation,
            supervisor: first.supervisor,
            coe: first.coe,
            office: first.office,
            shift: first.shift,
            totalHours,
            qualifyingScore,
            requiredScore,
            isCompliant,
            gap
        };
    });
}

/**
 * Filters summaries based on criteria
 */
export function filterData(
    summaries: EmployeeSummary[],
    filters: {
        epf?: string;
        supervisor?: string;
        coe?: string;
        office?: string;
        shift?: string;
    }
) {
    return summaries.filter((s) => {
        if (filters.epf && !s.epf.toLowerCase().includes(filters.epf.toLowerCase()) && !s.name.toLowerCase().includes(filters.epf.toLowerCase())) return false;
        if (filters.supervisor && s.supervisor !== filters.supervisor) return false;
        if (filters.coe && s.coe !== filters.coe) return false;
        if (filters.office && s.office !== filters.office) return false;
        if (filters.shift && s.shift !== filters.shift) return false;
        return true;
    });
}
