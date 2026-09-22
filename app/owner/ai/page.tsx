"use client";

import React, { useState, useEffect } from "react";
import { OwnerShell } from "@/components/owner/OwnerShell";
import {
  Cpu,
  Layers,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  ArrowRight,
  ShieldCheck,
  Zap,
  Key,
  Trash2,
  ExternalLink,
  Check,
  X,
  Eye,
  EyeOff,
  Activity,
} from "lucide-react";

export default function OwnerAiPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  // New Provider Form state
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newProtocol, setNewProtocol] = useState<"OPENAI_COMPATIBLE" | "GOOGLE_GEMINI" | "ANTHROPIC">("OPENAI_COMPATIBLE");
  const [newApiKey, setNewApiKey] = useState("");
  const [newBaseUrl, setNewBaseUrl] = useState("");
  const [newModelName, setNewModelName] = useState("");
  const [newTaskType, setNewTaskType] = useState("ALL");
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Edit Key state
  const [editApiKey, setEditApiKey] = useState("");
  const [editBaseUrl, setEditBaseUrl] = useState("");
  const [editModelName, setEditModelName] = useState("");
  const [editProtocol, setEditProtocol] = useState<any>("OPENAI_COMPATIBLE");

  // Live Testing state
  const [testingStatus, setTestingStatus] = useState<Record<string, { loading: boolean; success?: boolean; message?: string; latency?: number }>>({});
  const [modalTestResult, setModalTestResult] = useState<{ loading: boolean; success?: boolean; message?: string; latency?: number } | null>(null);

  const loadAiConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/ai");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAiConfig();
  }, []);

  const handleUpdateRouting = async (ruleId: string, updates: any) => {
    try {
      const res = await fetch("/api/owner/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_routing_rule",
          ruleId,
          data: updates,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update routing rule");
      loadAiConfig();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleProviderStatus = async (provider: any) => {
    const nextStatus = provider.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    try {
      const res = await fetch("/api/owner/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_provider",
          providerId: provider.id,
          data: { status: nextStatus },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update provider status");
      loadAiConfig();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSetDefault = async (providerId: string) => {
    try {
      const res = await fetch("/api/owner/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_provider",
          providerId,
          data: { isDefault: true },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to set default provider");
      loadAiConfig();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTestCardConnection = async (prov: any) => {
    setTestingStatus((prev) => ({ ...prev, [prov.id]: { loading: true } }));
    let models: string[] = [];
    try {
      models = typeof prov.modelsJson === "string" ? JSON.parse(prov.modelsJson || "[]") : (prov.modelsJson || []);
    } catch {
      models = [];
    }

    try {
      const res = await fetch("/api/owner/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_connection",
          data: {
            provider: prov.provider,
            displayName: prov.displayName,
            protocol: prov.protocol,
            apiKey: prov.apiKeyEncrypted,
            baseUrl: prov.baseUrl,
            modelName: models[0] || (prov.provider === "GOOGLE" ? "gemini-3.6-flash" : "gpt-4o-mini"),
          },
        }),
      });
      const result = await res.json();
      setTestingStatus((prev) => ({
        ...prev,
        [prov.id]: {
          loading: false,
          success: result.success,
          message: result.message,
          latency: result.latencyMs,
        },
      }));
    } catch (err: any) {
      setTestingStatus((prev) => ({
        ...prev,
        [prov.id]: {
          loading: false,
          success: false,
          message: err.message || "Failed to test connection",
        },
      }));
    }
  };

  const handleTestModalConnection = async () => {
    if (!newApiKey.trim()) {
      alert("Please enter an API key first.");
      return;
    }
    setModalTestResult({ loading: true });
    try {
      const res = await fetch("/api/owner/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_connection",
          data: {
            displayName: newDisplayName || "Custom AI Model",
            protocol: newProtocol,
            apiKey: newApiKey,
            baseUrl: newBaseUrl,
            modelName: newModelName,
          },
        }),
      });
      const result = await res.json();
      setModalTestResult({
        loading: false,
        success: result.success,
        message: result.message,
        latency: result.latencyMs,
      });
    } catch (err: any) {
      setModalTestResult({
        loading: false,
        success: false,
        message: err.message || "Connection test failed",
      });
    }
  };

  const handleCreateCustomProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisplayName || !newApiKey) {
      alert("Please enter a display name and API key.");
      return;
    }
    try {
      const res = await fetch("/api/owner/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_custom_provider",
          data: {
            displayName: newDisplayName,
            protocol: newProtocol,
            apiKey: newApiKey,
            baseUrl: newBaseUrl,
            modelName: newModelName,
            taskType: newTaskType,
            isDefault: newIsDefault,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add custom AI model");

      // Reset form
      setNewDisplayName("");
      setNewApiKey("");
      setNewBaseUrl("");
      setNewModelName("");
      setIsAddModalOpen(false);
      setModalTestResult(null);
      loadAiConfig();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteProvider = async (providerId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove the custom provider "${name}"?`)) return;
    try {
      const res = await fetch("/api/owner/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_provider",
          providerId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete provider");
      loadAiConfig();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openEditModal = (prov: any) => {
    setSelectedProvider(prov);
    setEditApiKey(prov.apiKeyEncrypted || "");
    setEditBaseUrl(prov.baseUrl || "");
    let models = [];
    try {
      models = typeof prov.modelsJson === "string" ? JSON.parse(prov.modelsJson || "[]") : (prov.modelsJson || []);
    } catch {}
    setEditModelName(models[0] || "");
    setEditProtocol(prov.protocol || (prov.provider === "GOOGLE" ? "GOOGLE_GEMINI" : "OPENAI_COMPATIBLE"));
    setIsEditModalOpen(true);
  };

  const handleSaveEditProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;
    try {
      const res = await fetch("/api/owner/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_provider_key",
          providerId: selectedProvider.id,
          data: {
            apiKey: editApiKey,
            baseUrl: editBaseUrl,
            modelName: editModelName,
            protocol: editProtocol,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update provider key");
      setIsEditModalOpen(false);
      loadAiConfig();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const applyPreset = (name: string, protocol: any, url: string, model: string) => {
    setNewDisplayName(name);
    setNewProtocol(protocol);
    setNewBaseUrl(url);
    setNewModelName(model);
  };

  return (
    <OwnerShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight font-mono">
              AI COMMAND CENTER
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
              NEURAL ROUTING MATRIX
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Connect any AI model (OpenAI, Gemini, DeepSeek, Groq, Claude, Mistral, Ollama) and route tasks with zero downtime.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Custom AI Model
          </button>

          <button
            onClick={loadAiConfig}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* AI Providers Overview */}
      <div id="providers" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            Configured AI Providers & Custom Models ({data?.providers?.length || 0})
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            Default Active Model: <strong className="text-emerald-400 font-semibold">{data?.providers?.find((p: any) => p.isDefault)?.displayName || "Google Gemini 3.6 Flash"}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(data?.providers || []).map((prov: any) => {
            let models: string[] = [];
            try {
              models = typeof prov.modelsJson === "string" ? JSON.parse(prov.modelsJson || "[]") : (prov.modelsJson || []);
            } catch {
              models = [];
            }
            const isActive = prov.status === "ACTIVE";
            const isCustom = prov.provider.startsWith("CUSTOM_");
            const hasKey = Boolean(prov.apiKeyEncrypted);
            const testState = testingStatus[prov.id];

            return (
              <div key={prov.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative group hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{prov.displayName}</span>
                    {prov.isDefault && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        DEFAULT
                      </span>
                    )}
                    {isCustom && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        CUSTOM
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {prov.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>Protocol:</span>
                    <span className="text-slate-200 font-semibold">{prov.protocol || (prov.provider === "GOOGLE" ? "GOOGLE_GEMINI" : "OPENAI_COMPATIBLE")}</span>
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>Active Model:</span>
                    <strong className="text-amber-300">{models[0] || (prov.provider === "GOOGLE" ? "gemini-3.6-flash" : "gpt-4o-mini")}</strong>
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>API Key:</span>
                    <span className={`font-semibold ${hasKey ? "text-emerald-400" : "text-amber-500"}`}>
                      {hasKey ? "••••••••••••" + (prov.apiKeyEncrypted.slice(-4)) : "Not configured"}
                    </span>
                  </p>
                  {prov.baseUrl && (
                    <p className="text-[10px] font-mono text-slate-500 truncate">
                      Endpoint: {prov.baseUrl}
                    </p>
                  )}
                </div>

                {/* Connection Ping status */}
                {testState && (
                  <div className={`p-2 rounded-xl text-[11px] font-mono flex items-center justify-between ${
                    testState.loading
                      ? "bg-slate-900 text-slate-400"
                      : testState.success
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                  }`}>
                    {testState.loading ? (
                      <span className="flex items-center gap-1.5"><RefreshCw className="w-3 h-3 animate-spin text-amber-400" /> Testing latency...</span>
                    ) : testState.success ? (
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Ping: {testState.latency}ms (Live)</span>
                    ) : (
                      <span className="truncate" title={testState.message}>⚠️ {testState.message?.slice(0, 35)}...</span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleTestCardConnection(prov)}
                      disabled={testState?.loading}
                      className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 border border-slate-800 flex items-center gap-1"
                      title="Test API Key"
                    >
                      <Zap className="w-3 h-3 text-amber-400" />
                      Test
                    </button>

                    <button
                      onClick={() => openEditModal(prov)}
                      className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 border border-slate-800 flex items-center gap-1"
                      title="Change API Key"
                    >
                      <Key className="w-3 h-3 text-purple-400" />
                      Edit Key
                    </button>

                    {!prov.isDefault && (
                      <button
                        onClick={() => handleSetDefault(prov.id)}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-amber-400 border border-slate-800"
                        title="Set as Default Provider"
                      >
                        Make Default
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {isCustom && (
                      <button
                        onClick={() => handleDeleteProvider(prov.id, prov.displayName)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        title="Delete Custom Model"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleProviderStatus(prov)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                        isActive
                          ? "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                          : "bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/50"
                      }`}
                    >
                      {isActive ? "Disable" : "Enable"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Routing Matrix */}
      <div id="routing" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Task-to-Model Routing Matrix
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Assign any configured model to specific tasks</span>
        </div>

        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[11px]">
                  <th className="px-4 py-3">Platform Task</th>
                  <th className="px-4 py-3">Assigned AI Model / Provider</th>
                  <th className="px-4 py-3">Target Model Identifier</th>
                  <th className="px-4 py-3">Temperature</th>
                  <th className="px-4 py-3">Max Output</th>
                  <th className="px-4 py-3 text-right">Route Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {(data?.routingRules || []).map((rule: any) => (
                  <tr key={rule.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-white">
                      {rule.taskType.replace(/_/g, " ")}
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={rule.providerName}
                        onChange={(e) => {
                          const selected = data?.providers?.find((p: any) => p.provider === e.target.value);
                          let defaultModel = rule.modelName;
                          if (selected) {
                            try {
                              const models = JSON.parse(selected.modelsJson || "[]");
                              if (models[0]) defaultModel = models[0];
                            } catch {}
                          }
                          handleUpdateRouting(rule.id, { providerName: e.target.value, modelName: defaultModel });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-400 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      >
                        {(data?.providers || []).map((p: any) => (
                          <option key={p.id} value={p.provider}>
                            {p.displayName} {p.status !== "ACTIVE" ? "(Disabled)" : ""}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      <input
                        type="text"
                        defaultValue={rule.modelName}
                        onBlur={(e) => handleUpdateRouting(rule.id, { modelName: e.target.value })}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs w-52 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </td>

                    <td className="px-4 py-3 text-slate-400 font-semibold">
                      {rule.temperature}
                    </td>

                    <td className="px-4 py-3 text-slate-400">
                      {rule.maxTokens} tokens
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleUpdateRouting(rule.id, { isEnabled: !rule.isEnabled })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rule.isEnabled
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {rule.isEnabled ? "ACTIVE" : "PAUSED"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: ADD CUSTOM AI MODEL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white font-mono flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Add Custom AI Model / Provider
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Plug in any API key (DeepSeek, Groq, Mistral, Ollama, Claude, etc.) and assign it to your platform.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setModalTestResult(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Quick Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset("DeepSeek V3", "OPENAI_COMPATIBLE", "https://api.deepseek.com", "deepseek-chat")}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 hover:bg-slate-850 text-sky-400 border border-slate-800"
                >
                  ⚡ DeepSeek
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("Groq Llama 3.3", "OPENAI_COMPATIBLE", "https://api.groq.com/openai/v1", "llama-3.3-70b-versatile")}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 hover:bg-slate-850 text-orange-400 border border-slate-800"
                >
                  ⚡ Groq (Fast)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("Google Gemini 3.6 Flash", "GOOGLE_GEMINI", "https://generativelanguage.googleapis.com/v1beta", "gemini-3.6-flash")}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-slate-800"
                >
                  ⚡ Google Gemini
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("OpenRouter Universal", "OPENAI_COMPATIBLE", "https://openrouter.ai/api/v1", "anthropic/claude-3.5-sonnet")}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 hover:bg-slate-850 text-purple-400 border border-slate-800"
                >
                  ⚡ OpenRouter
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("Local Ollama", "OPENAI_COMPATIBLE", "http://localhost:11434/v1", "llama3")}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800"
                >
                  💻 Local Ollama
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateCustomProvider} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Model / Provider Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DeepSeek V3, Groq Llama"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">API Protocol *</label>
                  <select
                    value={newProtocol}
                    onChange={(e: any) => setNewProtocol(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="OPENAI_COMPATIBLE">OpenAI Compatible (/chat/completions)</option>
                    <option value="GOOGLE_GEMINI">Google Gemini Native (AI Studio)</option>
                    <option value="ANTHROPIC">Anthropic Claude (/messages)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Secret API Key *</span>
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showKey ? "Hide" : "Show"}
                  </button>
                </label>
                <input
                  type={showKey ? "text" : "password"}
                  required
                  placeholder="sk-... or gsk_... or AQ.Ab8..."
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Model Identifier *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. deepseek-chat, gemini-3.6-flash, gpt-4o"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Base URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="Leave empty for official API"
                    value={newBaseUrl}
                    onChange={(e) => setNewBaseUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Assign to Task</label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="ALL">All Tasks (Universal Copilot)</option>
                    <option value="PRODUCT_RESEARCH">Product Research & Demand Scoring</option>
                    <option value="AD_GENERATION">Ad Generation & Creative Hooks</option>
                    <option value="CUSTOMER_SUPPORT">Customer Support Messaging</option>
                    <option value="PRICING_OPTIMIZATION">Pricing & Profit Analysis</option>
                    <option value="NONE">Do Not Auto-Assign (Standby)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isDef"
                    checked={newIsDefault}
                    onChange={(e) => setNewIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-400"
                  />
                  <label htmlFor="isDef" className="text-xs text-slate-300 font-semibold cursor-pointer">
                    Set as Default Primary AI Model
                  </label>
                </div>
              </div>

              {/* Test Result feedback */}
              {modalTestResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-mono flex items-start gap-2 ${
                    modalTestResult.loading
                      ? "bg-slate-900 text-slate-400"
                      : modalTestResult.success
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {modalTestResult.loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400 flex-shrink-0" />
                  ) : modalTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-bold">{modalTestResult.loading ? "Testing model endpoint..." : modalTestResult.message}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleTestModalConnection}
                  disabled={modalTestResult?.loading}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 text-xs font-bold flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Test Connection First
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20"
                  >
                    Save & Activate Model
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT API KEY */}
      {isEditModalOpen && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" />
                Edit Credentials: {selectedProvider.displayName}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProvider} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">API Key</label>
                <input
                  type="text"
                  placeholder="Paste new API key here"
                  value={editApiKey}
                  onChange={(e) => setEditApiKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Target Model Name</label>
                <input
                  type="text"
                  placeholder="e.g. gemini-3.6-flash, gpt-4o, deepseek-chat"
                  value={editModelName}
                  onChange={(e) => setEditModelName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Base URL</label>
                <input
                  type="text"
                  placeholder="Optional custom base endpoint"
                  value={editBaseUrl}
                  onChange={(e) => setEditBaseUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OwnerShell>
  );
}
