"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

// Mock Data
const reports = [
  { id: 12, reporter: "小红", suspect: "User_X", item: "iPhone 14 Pro", reason: "诈骗：收钱不发货", status: "未处理", time: "10分钟前" },
  { id: 11, reporter: "张三", suspect: "李四", item: "二手显卡", reason: "货不对板", status: "已处理", result: "下架商品", time: "2小时前" },
];

export default function ReportManagement() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 flex items-center gap-4 bg-red-50 border-red-100">
          <div className="p-3 bg-red-100 rounded-full text-red-600"><AlertTriangle /></div>
          <div>
            <p className="text-sm text-muted-foreground">待处理举报</p>
            <p className="text-2xl font-bold text-red-700">12</p>
          </div>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-8">举报列表</h2>
      
      <div className="grid gap-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-card border rounded-xl p-5 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={report.status === "未处理" ? "destructive" : "secondary"}>
                  {report.status}
                </Badge>
                <span className="font-mono text-xs text-muted-foreground">ID: #{report.id}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock size={12} /> {report.time}
                </span>
              </div>
              <h3 className="font-semibold text-lg">
                举报对象：{report.item} <span className="text-muted-foreground font-normal">({report.suspect})</span>
              </h3>
              <p className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded w-fit">
                原因: {report.reason}
              </p>
              <p className="text-xs text-muted-foreground">举报人: {report.reporter}</p>
            </div>

            {report.status === "未处理" ? (
              <div className="flex gap-2">
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  封禁用户
                </Button>
                <Button variant="outline">删除商品</Button>
                <Button>标记已处理</Button>
              </div>
            ) : (
               <div className="text-right">
                  <p className="text-sm font-medium text-green-600 flex items-center gap-1">
                    <CheckCircle size={14} /> 已完成
                  </p>
                  <p className="text-xs text-muted-foreground">处理动作: {report.result}</p>
               </div>
            )}
          </div>
        ))}
      </div>

      {/* Audit Log Section (Mock) */}
      <div className="mt-12 pt-6 border-t">
        <h3 className="text-lg font-bold mb-4">🛡️ 处理记录 (Audit Log)</h3>
        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-xs space-y-2">
          <p><span className="text-slate-500">[2026-03-05 10:00]</span> Admin_01 banned user "Spammer" (Reason: Ad spam)</p>
          <p><span className="text-slate-500">[2026-03-05 09:45]</span> Admin_02 deleted item #992 (Reason: Prohibited item)</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          * 系统自动记录所有管理员操作，被封禁用户在登录时将看到具体的封禁原因 (reason字段)。
        </p>
      </div>
    </div>
  );
}