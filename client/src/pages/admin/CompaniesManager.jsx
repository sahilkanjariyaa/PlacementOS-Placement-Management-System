import React, { useState, useEffect } from 'react';
import { companyService } from '../../services/companyService.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import {
  Building2,
  PlusCircle,
  Search,
  Globe,
  MapPin,
  Mail,
  User,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const CompaniesManager = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    location: '',
    hrName: '',
    hrEmail: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await companyService.getCompanies({ search });
      if (res.success) setCompanies(res.data);
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCompanies();
  };

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      industry: '',
      website: '',
      location: '',
      hrName: '',
      hrEmail: '',
    });
    setError('');
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (comp) => {
    setEditingCompany(comp);
    setFormData({
      name: comp.name,
      industry: comp.industry,
      website: comp.website,
      location: comp.location,
      hrName: comp.hrName,
      hrEmail: comp.hrEmail,
    });
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingCompany) {
        await companyService.updateCompany(editingCompany._id, formData);
        setSuccess('Company updated successfully.');
        setEditingCompany(null);
      } else {
        await companyService.createCompany(formData);
        setSuccess('Company added successfully.');
        setIsCreateOpen(false);
      }
      fetchCompanies();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (comp) => {
    try {
      await companyService.updateCompany(comp._id, { isActive: !comp.isActive });
      fetchCompanies();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Corporate Partners</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage hiring partner profiles, HR point-of-contacts, and recruitment histories.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Corporate Partner</span>
        </button>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search company by name, industry, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
        >
          Search
        </button>
      </form>

      {/* Companies Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching corporate partners..." />
      ) : companies.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          No corporate partners found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((comp) => (
            <div
              key={comp._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {comp.industry}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{comp.name}</h3>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(comp)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition ${
                      comp.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {comp.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{comp.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <a
                      href={comp.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-600 hover:underline truncate"
                    >
                      {comp.website}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">
                      HR: {comp.hrName} ({comp.hrEmail})
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(comp)}
                  className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                  title="Edit Company"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingCompany}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingCompany(null);
        }}
        title={editingCompany ? `Edit Corporate Partner: ${editingCompany.name}` : 'Add Corporate Partner'}
        maxWidth="max-w-lg"
      >
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Legal Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. NovaTech Systems"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Industry Sector *</label>
              <input
                type="text"
                required
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g. Cloud Infrastructure"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Bengaluru, India"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Corporate Website URL *</label>
            <input
              type="url"
              required
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://company.example.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">HR Representative *</label>
              <input
                type="text"
                required
                value={formData.hrName}
                onChange={(e) => setFormData({ ...formData, hrName: e.target.value })}
                placeholder="e.g. Ananya Deshmukh"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">HR Email Address *</label>
              <input
                type="email"
                required
                value={formData.hrEmail}
                onChange={(e) => setFormData({ ...formData, hrEmail: e.target.value })}
                placeholder="hr@company.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingCompany(null);
              }}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingCompany ? 'Update Company' : 'Add Company'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
