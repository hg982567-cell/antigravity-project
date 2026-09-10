"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Lock, ShieldAlert, KeyRound, AlertTriangle } from "lucide-react";

interface ReAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string, mfaCode: string) => Promise<void>;
  title: string;
  actionDescription: string;
  isDestructive?: boolean;
}

export function ReAuthModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  actionDescription,
  isDestructive = false,
}: ReAuthModalProps) {
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Owner password is required.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await onConfirm(password, mfaCode);
      onClose();
      setPassword("");
      setMfaCode("");
    } catch (err: any) {
      setError(err.message || "Re-authentication failed. Please check credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Elevated Privilege Verification: High-risk actions require explicit Owner re-authentication."
    >
      <div className="space-y-4 pt-2">
        {/* Warning Banner */}
        <div
          className={`p-3 rounded-xl border flex items-start gap-3 text-xs ${
            isDestructive
              ? "bg-rose-950/30 border-rose-800/50 text-rose-300"
              : "bg-amber-950/30 border-amber-800/50 text-amber-300"
          }`}
        >
          {isDestructive ? (
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          )}
          <div>
            <span className="font-bold block">Sensitive Operation Confirmation:</span>
            <span>{actionDescription}</span>
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-900/40 border border-rose-700/60 text-rose-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Owner Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter current Owner password"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              2FA / Emergency Recovery Code <span className="text-slate-500">(Optional if bypass)</span>
            </label>
            <div className="relative">
              <KeyRound className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="6-digit authenticator or recovery code"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-slate-500 font-mono tracking-wider"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-1.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-1.5 ${
                isDestructive
                  ? "bg-rose-600 hover:bg-rose-700 shadow-rose-900/40"
                  : "bg-amber-600 hover:bg-amber-700 shadow-amber-900/40"
              }`}
            >
              {submitting ? "Verifying..." : "Confirm & Execute"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
