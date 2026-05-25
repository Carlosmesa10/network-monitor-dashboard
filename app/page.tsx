"use client";

import { useEffect, useState } from "react";

import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Network,
  Server,
  Wifi,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const API_BASE = "https://network-monitor-api-production.up.railway.app/api/v1";

export default function Dashboard() {
  const [devices, setDevices] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [devicesRes, healthRes] = await Promise.all([
        fetch(`${API_BASE}/devices/status`),
        fetch(`${API_BASE}/health`),
      ]);

      const devicesJson = await devicesRes.json();
      const healthJson = await healthRes.json();

      // IMPORTANTE
      setDevices(devicesJson.devices || []);
      setHealth(healthJson || {});
    } catch (error) {
      console.error("Error conectando API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const onlineDevices = devices.filter(
    (d) => d.status === "online"
  ).length;

  const warningDevices = devices.filter(
    (d) => d.status === "warning"
  ).length;

  const criticalDevices = devices.filter(
    (d) => d.status === "critical"
  ).length;

  const chartData = devices.map((device) => ({
    name: device.device,
    latency: device.latency,
  }));

  const pieData = [
    {
      name: "Online",
      value: onlineDevices,
      color: "#22c55e",
    },
    {
      name: "Warning",
      value: warningDevices,
      color: "#eab308",
    },
    {
      name: "Critical",
      value: criticalDevices,
      color: "#ef4444",
    },
  ];

  const getStatusClass = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";

      case "warning":
        return "bg-yellow-500";

      case "critical":
        return "bg-red-500";

      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <Network className="w-16 h-16 animate-pulse mx-auto mb-4 text-cyan-400" />

          <h1 className="text-3xl font-bold">
            Cargando Dashboard...
          </h1>

          <p className="text-slate-400 mt-2">
            Conectando con la API
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="mb-8">

          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Activity className="w-10 h-10 text-cyan-400" />

            Enterprise Network Monitor
          </h1>

          <p className="text-slate-400 mt-2">
            Sistema de Monitoreo de Red Empresarial
          </p>

        </div>

        {/* CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

          <Card
            title="Dispositivos"
            value={devices.length}
            icon={<Server className="w-6 h-6" />}
          />

          <Card
            title="Online"
            value={onlineDevices}
            icon={<CheckCircle className="w-6 h-6" />}
          />

          <Card
            title="Warning"
            value={warningDevices}
            icon={<AlertTriangle className="w-6 h-6" />}
          />

          <Card
            title="API"
            value={health?.status || "OK"}
            icon={<Wifi className="w-6 h-6" />}
          />

        </div>

        {/* CHARTS */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* LINE CHART */}

          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6">

            <h2 className="text-2xl font-semibold mb-6">
              Latencia de Red
            </h2>

            <div className="h-[350px]">

              <ResponsiveContainer width="100%" height="100%">

                <LineChart data={chartData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                  />

                  <YAxis
                    stroke="#94a3b8"
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="latency"
                    stroke="#06b6d4"
                    strokeWidth={3}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* PIE CHART */}

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">

            <h2 className="text-2xl font-semibold mb-6">
              Estado General
            </h2>

            <div className="h-[350px]">

              <ResponsiveContainer width="100%" height="100%">

                <PieChart>

                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label
                  >

                    {pieData.map((entry, index) => (

                      <Cell
                        key={index}
                        fill={entry.color}
                      />

                    ))}

                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

        {/* TABLE */}

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">

          <div className="p-6 border-b border-slate-800">

            <h2 className="text-2xl font-semibold">
              Estado de Dispositivos
            </h2>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-800">

                <tr>

                  <th className="text-left p-4">
                    Dispositivo
                  </th>

                  <th className="text-left p-4">
                    Estado
                  </th>

                  <th className="text-left p-4">
                    Latencia
                  </th>

                  <th className="text-left p-4">
                    Packet Loss
                  </th>

                  <th className="text-left p-4">
                    Bandwidth
                  </th>

                  <th className="text-left p-4">
                    CPU
                  </th>

                  <th className="text-left p-4">
                    RAM
                  </th>

                </tr>

              </thead>

              <tbody>

                {devices.map((device, index) => (

                  <tr
                    key={index}
                    className="border-t border-slate-800 hover:bg-slate-800/40"
                  >

                    <td className="p-4 font-medium">
                      {device.device}
                    </td>

                    <td className="p-4">

                      <div className="flex items-center gap-2">

                        <div
                          className={`w-3 h-3 rounded-full ${getStatusClass(
                            device.status
                          )}`}
                        />

                        <span className="capitalize">
                          {device.status}
                        </span>

                      </div>

                    </td>

                    <td className="p-4">
                      {device.latency} ms
                    </td>

                    <td className="p-4">
                      {device.packetLoss}%
                    </td>

                    <td className="p-4">
                      {device.bandwidth} Mbps
                    </td>

                    <td className="p-4">
                      {device.cpu}%
                    </td>

                    <td className="p-4">
                      {device.ram}%
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </div>
  );
}

function Card({
  title,
  value,
  icon,
}: {
  title: string;
  value: any;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-slate-400 text-sm">
            {title}
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {value}
          </h2>

        </div>

        <div className="bg-cyan-500/10 text-cyan-400 p-4 rounded-2xl">
          {icon}
        </div>

      </div>

    </div>
  );
}