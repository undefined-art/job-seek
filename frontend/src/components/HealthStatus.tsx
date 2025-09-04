"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { checkHealth } from "@/lib/api";

interface HealthStatusProps {
  onStatusChange?: (healthy: boolean) => void;
}

export function HealthStatus({ onStatusChange }: HealthStatusProps) {
  const [health, setHealth] = useState<{
    healthy: boolean;
    message: string;
    ollamaAvailable: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const healthData = await checkHealth();

        setHealth(healthData);
        onStatusChange?.(healthData.healthy && healthData.ollamaAvailable);
      } catch (error) {
        setHealth({
          healthy: false,
          message: "Failed to check system health",
          ollamaAvailable: false,
        });

        onStatusChange?.(false);
      } finally {
        setLoading(false);
      }
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000);

    return () => clearInterval(interval);
  }, [onStatusChange]);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Checking system status...</span>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <XCircle className="w-4 h-4 text-gray-400" />
        <span>Status unknown</span>
      </div>
    );
  }

  const getStatusIcon = () => {
    if (health.healthy && health.ollamaAvailable) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }

    if (health.healthy && !health.ollamaAvailable) {
      return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }

    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getStatusText = () => {
    if (health.healthy && health.ollamaAvailable) {
      return "All systems ready";
    }

    if (health.healthy && !health.ollamaAvailable) {
      return "Backend ready, AI unavailable";
    }

    return "System issues detected";
  };

  const getStatusColor = () => {
    if (health.healthy && health.ollamaAvailable) {
      return "text-green-600";
    }

    if (health.healthy && !health.ollamaAvailable) {
      return "text-yellow-600";
    }

    return "text-red-600";
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      {getStatusIcon()}
      <span className={getStatusColor()}>{getStatusText()}</span>
      {!health.ollamaAvailable && (
        <span className="text-xs text-gray-500">(Ollama not running)</span>
      )}
    </div>
  );
}
