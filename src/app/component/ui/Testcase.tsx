import { 
    CheckCircle, XCircle, AlertTriangle, Clock, Cpu, Ban, Loader2 
  } from "lucide-react";
  
  export default function Testcase({ testcases }: { testcases: string[] }) {
  
    const statusConfig: Record<string, any> = {
      PENDING: {
        label: "…",
        icon: Loader2,
        color: "bg-gray-100 text-gray-600 border-gray-300",
        spin: true,
      },
      COMPILATION_ERROR: {
        label: "CE",
        icon: Ban,
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      },
      PASSED: {
        label: "AC",
        icon: CheckCircle,
        color: "bg-green-50 text-green-700 border-green-200",
      },
      ACCEPTED: {
        label: "AC",
        icon: CheckCircle,
        color: "bg-green-50 text-green-700 border-green-200",
      },
      FAILED: {
        label: "WA",
        icon: XCircle,
        color: "bg-red-50 text-red-700 border-red-200",
      },
      TIME_LIMIT_EXCEEDED: {
        label: "TLE",
        icon: Clock,
        color: "bg-orange-50 text-orange-700 border-orange-200",
      },
      MEMORY_LIMIT_EXCEEDED: {
        label: "MLE",
        icon: Cpu,
        color: "bg-purple-50 text-purple-700 border-purple-200",
      },
      RUNTIME_ERROR: {
        label: "RTE",
        icon: AlertTriangle,
        color: "bg-pink-50 text-pink-700 border-pink-200",
      }
    };
  
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-3">Test Cases</h3>
  
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {testcases.map((status, index) => {
            const cfg = statusConfig[status] || {
              label: status,
              icon: Ban,
              color: "bg-gray-50 text-gray-700 border-gray-300",
            };
  
            const Icon = cfg.icon;
  
            return (
              <div
                key={index}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg shadow-sm hover:shadow-md transition-all cursor-default ${cfg.color}`}
              >
                <Icon 
                  size={18} 
                  className={`${cfg.spin ? "animate-spin" : ""} opacity-80`} 
                />
                <span className="font-medium">
                  {index + 1}. {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  