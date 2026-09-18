import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { companyService } from '../../services/companyService.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Building, Globe, MapPin, Mail, User, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export const RecruiterCompanyProfile = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    location: '',
    hrName: '',
    hrEmail: '',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompany = async () => {
      const compId = user?.companyId?._id || user?.companyId || user?.company?._id || user?.company;
      if (!compId) {
        setLoading(false);
        return;
      }
      try {
        const res = await companyService.getCompanyById(compId);
        if (res.success && res.data.company) {
          const c = res.data.company;
          setCompany(c);
          setFormData({
            name: c.name,
            industry: c.industry,
            website: c.website,
            location: c.location,
            hrName: c.hrName,
            hrEmail: c.hrEmail,
          });
        }
      } catch (err) {
        console.error('Failed to load company:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    try {
      const compId = user?.companyId?._id || user?.companyId || user?.company?._id || user?.company;
      await companyService.updateCompany(compId, formData);
      setMessage('Company profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update company.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching company profile..." size="lg" />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Corporate Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Maintain your corporate branding, headquarters address, and campus HR representative contacts.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Legal Name *</label>
            <input
              type="text"
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Industry Sector *</label>
            <input
              type="text"
              required
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Headquarters Location *</label>
            <input
              type="text"
              required
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Corporate Website *</label>
            <input
              type="url"
              required
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">HR Representative Name *</label>
            <input
              type="text"
              required
              name="hrName"
              value={formData.hrName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">HR Email Address *</label>
            <input
              type="email"
              required
              name="hrEmail"
              value={formData.hrEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Corporate Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
