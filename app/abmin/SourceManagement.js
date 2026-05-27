"use client";
import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Video,
  Tv,
  ExternalLink,
  Database
} from "lucide-react";
import { saveVideoSource, deleteVideoSource, seedVideoSources } from "./action";

const SourceManagement = ({ initialSources }) => {
  const [sources, setSources] = useState(initialSources);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    url: "",
    params: "",
    type: "movie",
    priority: 0,
    active: true,
    icon: "Play",
    features: "",
    description: "",
    paramStyle: "query"
  });

  const handleEdit = (source) => {
    setEditingId(source.id);
    setFormData({
      ...source,
      features: Array.isArray(source.features) ? source.features.join(", ") : (source.features || ""),
      params: source.params || "",
      icon: source.icon || "Play",
      description: source.description || "",
      paramStyle: source.paramStyle || "query"
    });
    setIsAdding(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      params: "",
      type: "movie",
      priority: 0,
      active: true,
      icon: "Play",
      features: "",
      description: "",
      paramStyle: "query"
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      priority: parseInt(formData.priority),
      features: formData.features.split(",").map(f => f.trim()).filter(f => f !== ""),
      id: editingId
    };

    await saveVideoSource(dataToSave);
    // In a real app we'd refresh the data, but since it's a server action with revalidatePath,
    // and we are using client state, we might need to manually update or rely on the prop update.
    // For simplicity, let's assume the user will refresh or we can update local state if we had a return value.
    window.location.reload();
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this source?")) {
      await deleteVideoSource(id);
      window.location.reload();
    }
  };

  const handleSeed = async () => {
    if (confirm("This will add default video sources if they don't exist. Continue?")) {
      await seedVideoSources();
      window.location.reload();
    }
  };

  const handleToggleActive = async (source) => {
    await saveVideoSource({
      ...source,
      active: !source.active
    });
    window.location.reload();
  };

  return (
    <section className="mt-12">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-white">Video Sources</h2>
        <div className="flex gap-3">
          <button
            onClick={handleSeed}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
            title="Seed default sources"
          >
            <Database size={18} /> Seed Defaults
          </button>
          <button
            onClick={() => { setIsAdding(true); setEditingId(null); resetForm(); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
          >
            <Plus size={18} /> Add Source
          </button>
        </div>
      </header>

      {(isAdding || editingId) && (
        <div className="bg-white rounded-[2rem] p-8 shadow-2xl mb-12 text-neutral-900">
          <h3 className="text-xl font-bold mb-6">{editingId ? "Edit Source" : "Add New Source"}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="bg-neutral-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. VidSrc"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="bg-neutral-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="movie">Movie</option>
                <option value="tv">TV Series</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Base URL</label>
              <input
                type="text"
                required
                value={formData.url}
                onChange={e => setFormData({...formData, url: e.target.value})}
                className="bg-neutral-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="https://vidsrc.me/embed/movie/"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Default Params</label>
              <input
                type="text"
                value={formData.params}
                onChange={e => setFormData({...formData, params: e.target.value})}
                className="bg-neutral-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="?autoplay=1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Param Style</label>
              <select
                value={formData.paramStyle}
                onChange={e => setFormData({...formData, paramStyle: e.target.value})}
                className="bg-neutral-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="query">Query (?id=123)</option>
                <option value="path-slash">Path Slash (/123/1/1)</option>
                <option value="path-hyphen-mapi">Path Hyphen MAPI (123-1-1)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Priority (Higher = First)</label>
              <input
                type="number"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
                className="bg-neutral-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Icon Name (Lucide)</label>
              <input
                type="text"
                value={formData.icon}
                onChange={e => setFormData({...formData, icon: e.target.value})}
                className="bg-neutral-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Play, Crown, Zap, etc."
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Features (comma separated)</label>
              <input
                type="text"
                value={formData.features}
                onChange={e => setFormData({...formData, features: e.target.value})}
                className="bg-neutral-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Recommended, Fast, Multi-Language"
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="bg-neutral-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Brief description of the source"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={e => setFormData({...formData, active: e.target.checked})}
                className="w-5 h-5 accent-indigo-600"
              />
              <label htmlFor="active" className="text-sm font-bold">Active</label>
            </div>
            <div className="md:col-span-2 flex gap-4 mt-4">
              <button
                type="submit"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
              >
                <Save size={18} /> Save Source
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 px-6 py-3 rounded-xl font-bold transition-all"
              >
                <X size={18} /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2rem] p-8 shadow-2xl overflow-hidden mb-12">
        <table className="w-full text-left">
          <thead>
            <tr className="text-neutral-400 text-[11px] uppercase tracking-[0.2em]">
              <th className="pb-6 font-semibold">Priority</th>
              <th className="pb-6 font-semibold">Source</th>
              <th className="pb-6 font-semibold">Type</th>
              <th className="pb-6 font-semibold">Status</th>
              <th className="pb-6 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-neutral-900">
            {sources.map((s) => (
              <tr key={s.id} className="group border-t border-neutral-100 hover:bg-neutral-50 transition-colors">
                <td className="py-6 font-bold text-neutral-400">
                  #{s.priority}
                </td>
                <td className="py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500">
                      {s.type === "movie" ? <Video size={16} /> : <Tv size={16} />}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{s.name}</div>
                      <div className="text-[10px] text-neutral-400 max-w-[200px] truncate">{s.url}</div>
                    </div>
                  </div>
                </td>
                <td className="py-6">
                  <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${
                    s.type === "movie" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                  }`}>
                    {s.type}
                  </span>
                </td>
                <td className="py-6">
                  <button onClick={() => handleToggleActive(s)} className="flex items-center gap-1">
                    {s.active ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                        <Eye size={14} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                        <EyeOff size={14} /> Inactive
                      </span>
                    )}
                  </button>
                </td>
                <td className="py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="p-2 hover:bg-indigo-50 text-neutral-400 hover:text-indigo-600 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-2 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sources.length === 0 && (
              <tr>
                <td colSpan="5" className="py-12 text-center text-neutral-400 font-medium">
                  No video sources configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default SourceManagement;
