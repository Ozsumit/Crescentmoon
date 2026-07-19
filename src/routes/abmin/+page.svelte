<script>
  import { onMount } from "svelte";
  import { fade, fly, scale } from "svelte/transition";
  import { Plus, Trash2, Edit2, Save, X, Server, Activity, Video, Tv, Search, Check, AlertTriangle, Loader2, Play } from "lucide-svelte";
  import { goto, invalidateAll } from "$app/navigation";

  let { data } = $props();
  let feedbacks = $derived(data.feedbacks || []);
  let initialSources = $derived(data.videoSources || []);

  let sources = $state([]);
  let searchQuery = $state("");
  let filter = $state("all");

  let isAdding = $state(false);
  let editingId = $state(null);
  let deleteConfirmId = $state(null);
  let toast = $state(null);

  let formData = $state({
    name: "",
    url: "",
    params: "",
    type: "movie",
    priority: 0,
    active: true,
    icon: "Play",
    features: [],
    description: "",
    paramStyle: "query"
  });

  const FEATURE_STYLES = {
    Recommended: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    Fast: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    "Multi-Language": "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    "Multi-sub": "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    "Clean UI": "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20"
  };

  onMount(() => {
    sources = initialSources;
  });

  $effect(() => {
    sources = initialSources;
  });

  function triggerToast(msg, type = "success") {
    toast = { msg, type };
    setTimeout(() => (toast = null), 3500);
  }

  function handleEdit(s) {
    editingId = s.id;
    formData = {
      name: s.name || "",
      url: s.url || "",
      params: s.params || "",
      type: s.type || "movie",
      priority: s.priority || 0,
      active: s.active !== false,
      icon: s.icon || "Play",
      features: s.features || [],
      description: s.description || "",
      paramStyle: s.paramStyle || "query"
    };
    isAdding = true;
  }

  function handleCancel() {
    isAdding = false;
    editingId = null;
    formData = {
      name: "",
      url: "",
      params: "",
      type: "movie",
      priority: 0,
      active: true,
      icon: "Play",
      features: [],
      description: "",
      paramStyle: "query"
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin?action=saveSource", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, id: editingId })
      });
      const result = await res.json();
      if (result.success) {
        triggerToast(editingId ? "Video source updated" : "New video source created");
        handleCancel();
        invalidateAll();
      } else {
        triggerToast(result.error || "Failed to save", "error");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function confirmDelete() {
    if (!deleteConfirmId) return;
    try {
      const res = await fetch("/api/admin?action=deleteSource", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteConfirmId })
      });
      const result = await res.json();
      if (result.success) {
        triggerToast("Source configuration removed");
        deleteConfirmId = null;
        invalidateAll();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDeleteFeedback(id) {
    try {
      const res = await fetch("/api/admin?action=deleteFeedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const result = await res.json();
      if (result.success) {
        triggerToast("Feedback log removed");
        invalidateAll();
      }
    } catch (e) {
      console.error(e);
    }
  }

  function toggleFeature(feature) {
    const list = formData.features || [];
    formData.features = list.includes(feature)
      ? list.filter((f) => f !== feature)
      : [...list, feature];
  }

  // Filter lists
  let filtered = $derived(
    sources
      .filter((s) => filter === "all" || s.type === filter)
      .filter((s) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q);
      })
  );

  let totalActive = $derived(sources.filter((s) => s.active).length);
</script>

<div class="min-h-screen bg-[#111] text-foreground p-6 md:p-12 pt-24 selection:bg-primary/30">
  <div class="max-w-5xl mx-auto">
    <header class="mb-12 flex justify-between items-center flex-wrap gap-4">
      <div>
        <h1 class="text-4xl font-extrabold tracking-tighter mb-2 text-foreground">Admin Panel</h1>
        <p class="text-neutral-500 font-medium">Control connection routes, endpoints, and attributes globally</p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Search -->
        <input
          type="text"
          placeholder="Search resources..."
          bind:value={searchQuery}
          class="pl-4 pr-4 py-2 text-xs font-semibold rounded-xl border border-border bg-card text-foreground focus:outline-none w-[200px]"
        />

        <button
          onclick={() => { handleCancel(); isAdding = true; }}
          class="flex items-center gap-2 bg-primary text-primary-foreground px-5 h-10 rounded-xl text-sm font-bold cursor-pointer"
        >
          <Plus size={16} /> Add Source
        </button>
      </div>
    </header>

    <!-- Source List Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {#each filtered as s}
        <div class="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                {s.type === "movie" ? "Movie Player" : "TV Series"}
              </span>
              <span class="w-1.5 h-1.5 rounded-full block {s.active ? 'bg-emerald-500' : 'bg-neutral-500'}" />
            </div>

            <h3 class="text-base font-extrabold text-foreground tracking-tight">{s.name}</h3>
            <p class="text-[10px] font-mono text-muted-foreground truncate mt-1">{s.url}</p>
            <p class="text-xs text-muted-foreground mt-3 line-clamp-2">{s.description || "No developer notes."}</p>
          </div>

          <div class="mt-5 pt-4 border-t border-border flex items-center justify-between">
            <span class="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
              PRIORITY: {s.priority}
            </span>
            <div class="flex gap-1.5">
              <button onclick={() => handleEdit(s)} class="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground cursor-pointer">
                <Edit2 size={13} />
              </button>
              <button onclick={() => (deleteConfirmId = s.id)} class="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive cursor-pointer">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- Feedbacks Table -->
    <header class="mb-8 mt-12">
      <h2 class="text-2xl font-bold text-foreground tracking-tight">User Feedback</h2>
    </header>

    <section class="bg-card rounded-[2rem] p-8 shadow-2xl border border-border overflow-hidden">
      <table class="w-full text-left">
        <thead>
          <tr class="text-neutral-400 text-[11px] uppercase tracking-[0.2em] border-b border-border">
            <th class="pb-6 font-semibold">Type</th>
            <th class="pb-6 font-semibold">Email</th>
            <th class="pb-6 font-semibold">Message</th>
            <th class="pb-6 font-semibold text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {#each feedbacks as f}
            <tr class="border-b border-border">
              <td class="py-6">
                <span class="text-[10px] font-bold tracking-widest uppercase bg-muted px-3 py-1 rounded-full text-foreground">
                  {f.type}
                </span>
              </td>
              <td class="py-6 text-sm font-medium text-muted-foreground">{f.email || "—"}</td>
              <td class="py-6 text-sm max-w-sm truncate text-foreground">{f.message}</td>
              <td class="py-6 text-right">
                <button onclick={() => handleDeleteFeedback(f.id)} class="text-destructive font-mono text-[10px] font-bold tracking-wider hover:underline cursor-pointer">
                  DISMISS
                </button>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="4" class="py-12 text-center text-muted-foreground">No feedbacks found.</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>
  </div>
</div>

<!-- Drawer overlay slide-over for creating/editing -->
{#if isAdding}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div onclick={handleCancel} class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"></div>
  <div transition:fly={{ x: 100, duration: 300 }} class="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-card border-l border-border shadow-2xl z-[151] overflow-y-auto p-6 flex flex-col justify-between">
    <div>
      <div class="flex items-center justify-between pb-4 border-b border-border mb-6">
        <h3 class="text-lg font-bold text-foreground">
          {editingId ? "Update Endpoint Config" : "Create Endpoint Node"}
        </h3>
        <button onclick={handleCancel} class="text-muted-foreground hover:text-foreground cursor-pointer">
          <X size={15} />
        </button>
      </div>

      <form onsubmit={handleSubmit} class="space-y-4">
        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Node Name</label>
          <input required class="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm" type="text" placeholder="e.g. VidLink" bind:value={formData.name} />
        </div>

        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Media Scope</label>
          <select class="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm cursor-pointer" bind:value={formData.type}>
            <option value="movie">Movie Container</option>
            <option value="tv">TV Series Node</option>
          </select>
        </div>

        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Base API Url</label>
          <input required class="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm" type="text" placeholder="e.g. https://vidlink.pro/tv/" bind:value={formData.url} />
        </div>

        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Routing Priority</label>
          <input class="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm" type="number" bind:value={formData.priority} />
        </div>

        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Dynamic Format Style</label>
          <select class="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm cursor-pointer" bind:value={formData.paramStyle}>
            <option value="query">Query param (?id=)</option>
            <option value="path-slash">Segment slash (/id)</option>
            <option value="path-hyphen-mapi">Hyphen MAPI (/id-season-ep)</option>
          </select>
        </div>

        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Custom Attributes</label>
          <div class="flex flex-wrap gap-1.5">
            {#each Object.keys(FEATURE_STYLES) as feature}
              {@const selected = formData.features.includes(feature)}
              <button
                type="button"
                onclick={() => toggleFeature(feature)}
                class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer {selected ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted border-border text-muted-foreground'}"
              >
                {feature}
              </button>
            {/each}
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Developer Description Notes</label>
          <textarea class="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm resize-none" rows="2" placeholder="Purpose or limits of this streaming path..." bind:value={formData.description}></textarea>
        </div>

        <div class="flex items-center gap-3 mt-4">
          <input type="checkbox" id="active-checkbox" bind:checked={formData.active} class="cursor-pointer" />
          <label for="active-checkbox" class="text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer">Active Connection</label>
        </div>

        <div class="pt-6 border-t border-border flex justify-end gap-2">
          <button type="button" onclick={handleCancel} class="px-4 py-2.5 rounded-xl border border-border text-xs font-bold uppercase tracking-wider cursor-pointer">Cancel</button>
          <button type="submit" class="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider cursor-pointer">Save Config</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Confirmation Dialogue modal -->
{#if deleteConfirmId}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div onclick={() => (deleteConfirmId = null)} class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[160]"></div>
  <div transition:scale class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-card border border-border p-6 rounded-2xl shadow-2xl z-[161]">
    <h4 class="font-extrabold text-sm uppercase tracking-wide text-rose-500 mb-2 flex items-center gap-2">
      <AlertTriangle size={18} /> Delete Source
    </h4>
    <p class="text-xs text-muted-foreground leading-relaxed mb-6">Are you sure you want to delete this video source configuration? This action is irreversible.</p>
    <div class="flex justify-end gap-2">
      <button onclick={() => (deleteConfirmId = null)} class="px-4 py-2 rounded-xl text-xs font-bold uppercase cursor-pointer">Cancel</button>
      <button onclick={confirmDelete} class="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold uppercase cursor-pointer">Delete</button>
    </div>
  </div>
{/if}

<!-- Toast notifications -->
{#if toast}
  <div transition:fly={{ y: 20 }} class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-card border border-border text-foreground px-5 py-3.5 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-3">
    <div class="w-5 h-5 rounded-full {toast.type === 'error' ? 'bg-destructive/20 text-destructive' : 'bg-emerald-500/20 text-emerald-400'} flex items-center justify-center">
      <Check size={12} />
    </div>
    {toast.msg}
  </div>
{/if}
