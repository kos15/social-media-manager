"use client";

import { PlatformChart } from "@/components/dashboard/PlatformChart";
import { ArrowUpRight } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          Analytics
        </h1>
        <select className="bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:outline-none w-full sm:w-auto">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-surface-elevated border border-border rounded-xl p-5 flex flex-col items-center justify-center text-center">
          <h4 className="text-sm font-medium text-text-secondary mb-2">
            Total Engagement
          </h4>
          <span className="text-3xl font-bold">124.5K</span>
          <span className="text-sm text-success flex items-center mt-2 bg-success/10 px-2 py-1 rounded-full">
            <ArrowUpRight className="w-3 h-3 mr-1" /> 12% vs last period
          </span>
        </div>
        <div className="bg-surface-elevated border border-border rounded-xl p-5 flex flex-col items-center justify-center text-center">
          <h4 className="text-sm font-medium text-text-secondary mb-2">
            Audience Growth
          </h4>
          <span className="text-3xl font-bold">+2,400</span>
          <span className="text-sm text-success flex items-center mt-2 bg-success/10 px-2 py-1 rounded-full">
            <ArrowUpRight className="w-3 h-3 mr-1" /> 8% vs last period
          </span>
        </div>
        <div className="bg-surface-elevated border border-border rounded-xl p-5 flex flex-col items-center justify-center text-center">
          <h4 className="text-sm font-medium text-text-secondary mb-2">
            Best Time to Post
          </h4>
          <span className="text-3xl font-bold">Thu, 10 AM</span>
          <span className="text-sm text-text-secondary mt-2">
            Based on your top performing posts
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-surface-elevated border border-border rounded-xl p-5 md:p-6 min-h-[300px] md:min-h-[400px] flex flex-col">
          <h3 className="font-semibold text-lg mb-4">Platform Growth</h3>
          <div className="flex-1 w-full min-h-[250px] md:min-h-[300px]">
            <PlatformChart />
          </div>
        </div>

        <div className="bg-surface-elevated border border-border rounded-xl p-5 md:p-6 min-h-[300px] md:min-h-[400px] flex flex-col">
          <h3 className="font-semibold text-lg mb-4">Top Performing Posts</h3>
          <div className="flex-1 overflow-auto -mx-1">
            <div className="min-w-[480px] px-1">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-secondary uppercase bg-surface">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Post</th>
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3">Engagements</th>
                    <th className="px-4 py-3 rounded-r-lg">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr
                      key={i}
                      className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors"
                    >
                      <td className="px-4 py-4 font-medium max-w-[160px] truncate">
                        Just released our new...
                      </td>
                      <td className="px-4 py-4 text-text-secondary">Twitter</td>
                      <td className="px-4 py-4">1,245</td>
                      <td className="px-4 py-4 text-text-secondary">
                        Oct {10 + i}, 2023
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
