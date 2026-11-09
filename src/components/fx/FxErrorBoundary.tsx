"use client";

import { Component, type ReactNode } from "react";

/** Jika layer WebGL gagal (shader, konteks hilang, dsb.), jatuh ke fallback 2D tanpa merusak halaman. */
export default class FxErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[fx] layer WebGL dinonaktifkan:", error);
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
