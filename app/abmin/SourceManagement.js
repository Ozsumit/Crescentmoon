"use client";

import React, { useState } from "react";

import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Eye,
  EyeOff,
  Video,
  Tv,
  Database,
} from "lucide-react";

import { saveVideoSource, deleteVideoSource } from "./action";

const defaultMovieSources = [
  {
    name: "vidking",
    url: "https://www.vidking.net/embed/movie/",
    params: "?color=c3f0c2&icons=default&autoplay=true&nextbutton=true",
    icon: "Crown",
    features: ["Recommended", "Fast"],
    description: "Fast loading with a modern player.",
    type: "movie",
    priority: 100,
    active: true,
    paramStyle: "query",
  },
  {
    name: "VidLink",
    url: "https://vidlink.pro/movie/",
    params:
      "?primaryColor=6a5fef&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=jw&title=true&poster=true&autoplay=true&nextbutton=true",
    icon: "Play",
    features: ["Recommended", "Fast"],
    description: "Fast loading with a modern player.",
    type: "movie",
    priority: 95,
    active: true,
    paramStyle: "query",
  },
  {
    name: "VidAPI",
    url: "https://vaplayer.ru/embed/movie/",
    params: "?skin=cinematic",
    icon: "Webhook",
    features: ["Recommended", "Fast"],
    description: "Fast loading with a modern player.",
    type: "movie",
    priority: 90,
    active: true,
    paramStyle: "query",
  },
  {
    name: "VidSrc",
    url: "https://v2.vidsrc.me/embed/movie/",
    params: "?multiLang=true",
    icon: "Languages",
    features: ["Multi-Language"],
    description: "Good source for non-English audio.",
    type: "movie",
    priority: 85,
    active: true,
    paramStyle: "query",
  },
  {
    name: "MoviesAPI",
    url: "https://moviesapi.club/movie/",
    params: "?multiLang=true",
    icon: "List",
    features: ["Multi-Language", "Fast"],
    description: "A reliable alternative with good subtitle support.",
    type: "movie",
    priority: 80,
    active: true,
    paramStyle: "query",
  },
  {
    name: "videasy",
    url: "https://player.videasy.net/movie/",
    params: "?multiLang=true",
    icon: "Clapperboard",
    features: ["Multi-sub", "Clean UI"],
    description: "Features a clean player with multiple subtitle choices.",
    type: "movie",
    priority: 75,
    active: true,
    paramStyle: "query",
  },
  {
    name: "Vidsrc 2",
    url: "https://vidsrc.net/embed/movie/",
    params: "?multiLang=true",
    icon: "Server",
    features: ["Multi-Language", "Backup"],
    description: "A secondary backup source for language options.",
    type: "movie",
    priority: 70,
    active: true,
    paramStyle: "query",
  },
  {
    name: "VidSrc 3",
    url: "https://vidsrc.icu/embed/movie/",
    params: "?multiLang=true",
    icon: "Languages",
    features: ["Multi-Language", "Backup"],
    description: "Alternative source for subtitles.",
    type: "movie",
    priority: 65,
    active: true,
    paramStyle: "query",
  },
  {
    name: "VidSrc 4",
    url: "https://player.vidsrc.co/embed/movie/",
    params:
      "?autoplay=true&autonext=true&nextbutton=true&poster=true&primarycolor=6C63FF&secondarycolor=9F9BFF&iconcolor=FFFFFF&fontcolor=FFFFFF&fontsize=16px&opacity=0.5&font=Poppins",
    icon: "Clapperboard",
    features: [],
    download: true,
    description: "A reliable classic player.",
    type: "movie",
    priority: 60,
    active: true,
    paramStyle: "query",
  },
  {
    name: "2Embed",
    url: "https://2embed.cc/embed/movie/",
    icon: "Film",
    features: ["Ads"],
    params: "?multiLang=true",
    description: "May have more pop-up ads.",
    type: "movie",
    priority: 55,
    active: true,
    paramStyle: "query",
  },
  {
    name: "Binge",
    url: "https://vidbinge.dev/embed/movie/",
    icon: "Zap",
    features: ["Fast"],
    parseUrl: true,
    description: "Quick-loading, lightweight player.",
    type: "movie",
    priority: 50,
    active: true,
    paramStyle: "query",
  },
];

const DEFAULT_TV_SOURCES = [
  {
    name: "vidking",
    url: "https://www.vidking.net/embed/tv/",
    paramStyle: "path-slash",
    icon: "Crown",
    features: ["Recommended", "Fast"],
    description: "Fast loading with a modern player.",
    type: "tv",
    priority: 100,
    active: true,
    params: "",
  },
  {
    name: "VidLink",
    url: "https://vidlink.pro/tv/",
    paramStyle: "path-slash",
    icon: "Play",
    features: ["Recommended"],
    description: "Fast loading with a modern player.",
    type: "tv",
    priority: 95,
    active: true,
    params: "",
  },
  {
    name: "VidAPI",
    url: "https://vaplayer.ru/embed/tv/",
    paramStyle: "path-slash",
    icon: "Webhook",
    features: ["Recommended"],
    description: "Fast loading with a modern player.",
    type: "tv",
    priority: 90,
    active: true,
    params: "",
  },
  {
    name: "VidSrc",
    url: "https://v2.vidsrc.me/embed/tv/",
    paramStyle: "path-slash",
    icon: "Languages",
    features: ["Multi-Language"],
    description: "Good for non-English audio.",
    type: "tv",
    priority: 85,
    active: true,
    params: "",
  },
  {
    name: "MoviesAPI",
    url: "https://moviesapi.club/tv/",
    paramStyle: "path-hyphen-mapi",
    icon: "List",
    features: ["Multi-Language"],
    description: "Reliable alternative.",
    type: "tv",
    priority: 80,
    active: true,
    params: "",
  },
  {
    name: "videasy",
    url: "https://player.videasy.net/tv/",
    paramStyle: "path-slash",
    icon: "Clapperboard",
    features: ["Multi-sub"],
    description: "Clean player with subtitle choices.",
    type: "tv",
    priority: 75,
    active: true,
    params: "",
  },
  {
    name: "Vidsrc 2",
    url: "https://vidsrc.to/embed/tv/",
    paramStyle: "path-slash",
    icon: "Server",
    features: ["Backup"],
    description: "Secondary backup source.",
    type: "tv",
    priority: 70,
    active: true,
    params: "",
  },
  {
    name: "2Embed",
    url: "https://2embed.cc/embed/tv/",
    paramStyle: "path-slash",
    icon: "ShieldAlert",
    features: ["Ads"],
    description: "Adblocker is highly recommended.",
    type: "tv",
    priority: 65,
    active: true,
    params: "",
  },
];

const SourceManagement = ({ initialSources }) => {
  const [sources] = useState(initialSources || []);

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
    paramStyle: "query",
  });

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
      paramStyle: "query",
    });
  };

  const handleEdit = (source) => {
    setEditingId(source.id);

    setFormData({
      ...source,
      features: Array.isArray(source.features)
        ? source.features.join(", ")
        : source.features || "",
    });

    setIsAdding(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await saveVideoSource({
      ...formData,
      priority: Number(formData.priority),
      features: formData.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      id: editingId,
    });

    window.location.reload();
  };

  const handleDelete = async (id) => {
    const confirmed = confirm("Delete this source?");

    if (!confirmed) return;

    await deleteVideoSource(id);

    window.location.reload();
  };

  const handleToggleActive = async (source) => {
    await saveVideoSource({
      ...source,
      active: !source.active,
    });

    window.location.reload();
  };

  const handleSeed = async () => {
    const confirmed = confirm("Seed all movie and TV sources?");

    if (!confirmed) return;

    try {
      const allSources = [...defaultMovieSources, ...DEFAULT_TV_SOURCES];

      for (const source of allSources) {
        await saveVideoSource({
          ...source,
          id: undefined,
        });
      }

      alert("All sources seeded successfully!");

      window.location.reload();
    } catch (error) {
      console.error(error);

      alert("Failed to seed sources");
    }
  };

  return (
    <section className="mt-12">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Video Sources
          </h2>

          <p className="text-neutral-500 text-sm mt-1">
            Manage movie & TV providers
          </p>
        </div>

        <div className="flex gap-3">
          {/* <button
            onClick={handleSeed}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
          >
            <Database size={18} />
            Seed Defaults
          </button> */}

          <button
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              resetForm();
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
          >
            <Plus size={18} />
            Add Source
          </button>
        </div>
      </header>

      {(isAdding || editingId) && (
        <div className="bg-white rounded-[2rem] p-8 shadow-2xl mb-12 text-neutral-900">
          <h3 className="text-xl font-bold mb-6">
            {editingId ? "Edit Source" : "Add New Source"}
          </h3>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              className="bg-neutral-100 rounded-xl px-4 py-3"
            />

            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value,
                })
              }
              className="bg-neutral-100 rounded-xl px-4 py-3"
            >
              <option value="movie">Movie</option>

              <option value="tv">TV</option>
            </select>

            <input
              type="text"
              placeholder="URL"
              value={formData.url}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  url: e.target.value,
                })
              }
              className="bg-neutral-100 rounded-xl px-4 py-3 md:col-span-2"
            />

            <input
              type="text"
              placeholder="Params"
              value={formData.params}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: e.target.value,
                })
              }
              className="bg-neutral-100 rounded-xl px-4 py-3"
            />

            <select
              value={formData.paramStyle}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paramStyle: e.target.value,
                })
              }
              className="bg-neutral-100 rounded-xl px-4 py-3"
            >
              <option value="query">Query</option>

              <option value="path-slash">Path Slash</option>

              <option value="path-hyphen-mapi">Path Hyphen MAPI</option>
            </select>

            <input
              type="number"
              placeholder="Priority"
              value={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value,
                })
              }
              className="bg-neutral-100 rounded-xl px-4 py-3"
            />

            <input
              type="text"
              placeholder="Icon"
              value={formData.icon}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  icon: e.target.value,
                })
              }
              className="bg-neutral-100 rounded-xl px-4 py-3"
            />

            <input
              type="text"
              placeholder="Features"
              value={formData.features}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  features: e.target.value,
                })
              }
              className="bg-neutral-100 rounded-xl px-4 py-3 md:col-span-2"
            />

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              className="bg-neutral-100 rounded-xl px-4 py-3 md:col-span-2"
            />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    active: e.target.checked,
                  })
                }
              />

              <span>Active</span>
            </div>

            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold"
              >
                <Save size={18} />
                Save
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 bg-neutral-200 text-neutral-700 px-6 py-3 rounded-xl font-bold"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2rem] p-8 shadow-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-neutral-400 text-[11px] uppercase tracking-[0.2em]">
              <th className="pb-6">Priority</th>

              <th className="pb-6">Source</th>

              <th className="pb-6">Type</th>

              <th className="pb-6">Status</th>

              <th className="pb-6 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="text-neutral-900">
            {sources.map((s) => (
              <tr
                key={s.id}
                className="border-t border-neutral-100 hover:bg-neutral-50"
              >
                <td className="py-6">#{s.priority}</td>

                <td className="py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                      {s.type === "movie" ? (
                        <Video size={16} />
                      ) : (
                        <Tv size={16} />
                      )}
                    </div>

                    <div>
                      <div className="font-bold text-sm">{s.name}</div>

                      <div className="text-[10px] text-neutral-400 truncate max-w-[240px]">
                        {s.url}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-6">
                  <span className="text-[10px] uppercase font-bold">
                    {s.type}
                  </span>
                </td>

                <td className="py-6">
                  <button onClick={() => handleToggleActive(s)}>
                    {s.active ? (
                      <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                        <Eye size={14} />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-500 text-xs font-bold">
                        <EyeOff size={14} />
                        Inactive
                      </span>
                    )}
                  </button>
                </td>

                <td className="py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="p-2 hover:bg-indigo-50 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-2 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default SourceManagement;
