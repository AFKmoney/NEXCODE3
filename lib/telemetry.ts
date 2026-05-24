import * as Sentry from "@sentry/nextjs";

/**
 * Nexus Telemetry Engine
 * Industrial-grade observability for tracking Wasm performance, AI latency, and system errors.
 */
class TelemetryManager {
  
  captureException(error: Error, context?: any) {
    console.error("[Nexus Telemetry] Error captured:", error, context);
    Sentry.captureException(error, { extra: context });
  }

  startTransaction(name: string, op: string) {
    // Sentry.startTransaction is deprecated in favor of startSpan in newer versions, 
    // but we'll use a simple log for this prototype or span if available.
    console.log(`[Nexus Telemetry] Starting Trace: ${name} (${op})`);
    return {
      finish: () => console.log(`[Nexus Telemetry] Trace Finished: ${name}`)
    };
  }

  logPerformance(metric: string, value: number, tags: Record<string, string> = {}) {
    console.log(`[Nexus Telemetry] Performance Metric - ${metric}: ${value}ms`, tags);
    Sentry.setTag("performance_metric", metric);
    // Real industrial setup would send this to Datadog or Custom CloudWatch Metrics
  }

  setUser(id: string, email?: string) {
    Sentry.setUser({ id, email });
  }
}

export const telemetry = new TelemetryManager();
