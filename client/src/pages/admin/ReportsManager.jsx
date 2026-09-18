import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import {
  DepartmentPlacementChart,
  ApplicationStatusChart,
  CompanySelectionChart,
  SalaryTierChart,
} from '../../components/charts/PlacementCharts.jsx';
import { FileSpreadsheet, Download, BarChart3, Award, TrendingUp } from 'lucide-react';

export const ReportsManager = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await reportService.getAnalytics();
        if (res.success) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExportCSV = () => {
    reportService.downloadPlacementReport();
  };

  if (loading) {
    return <LoadingSpinner text="Compiling institutional placement analytics..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Institutional Placement Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Analyze departmental conversion rates, company-wise selections, and export audited CSV reports.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition self-start"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Placements CSV</span>
        </button>
      </div>

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Conversion */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
            Department-wise Placement Distribution
          </h3>
          <p className="text-xs text-slate-400 mb-4">Total Placed vs Seeking candidates by branch</p>
          <DepartmentPlacementChart data={analytics?.departmentPlacements || []} />
        </div>

        {/* Application Stages */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
            Recruitment Funnel & Stage Breakdown
          </h3>
          <p className="text-xs text-slate-400 mb-4">Candidate progression across recruitment rounds</p>
          <ApplicationStatusChart data={analytics?.applicationsByStatus || []} />
        </div>

        {/* Company Leaderboard */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
            Top Hiring Corporate Partners
          </h3>
          <p className="text-xs text-slate-400 mb-4">Companies by total offers rolled out</p>
          <CompanySelectionChart data={analytics?.companySelections || []} />
        </div>

        {/* Salary Tiers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
            CTC Compensation Tier Breakdown
          </h3>
          <p className="text-xs text-slate-400 mb-4">Number of active drives across package ranges</p>
          <SalaryTierChart data={analytics?.salaryDistribution || []} />
        </div>
      </div>
    </div>
  );
};
