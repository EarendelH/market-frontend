"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface BuyerOrderConfirmation {
  meetingDate: string;
  timeSlot: string;
  location: string;
  locationDetail: string;
}

interface BuyerOrderConfirmationModalProps {
  itemTitle: string;
  sellerName: string;
  price: number;
  itemLocation: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (selection: BuyerOrderConfirmation) => void;
}

const TIME_SLOTS = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "12:00 - 13:00",
  "14:00 - 15:00",
  "16:00 - 17:00",
  "19:00 - 20:00",
];

const COMMON_LOCATIONS = ["荔园宿舍", "南园宿舍", "图书馆门口", "一食堂门口", "工学院广场"];

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(dateString: string) {
  if (!dateString) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${dateString}T00:00:00`));
}

export function BuyerOrderConfirmationModal({
  itemTitle,
  sellerName,
  price,
  itemLocation,
  open,
  onOpenChange,
  onConfirm,
}: BuyerOrderConfirmationModalProps) {
  const tomorrow = useMemo(() => {
    const value = new Date();
    value.setDate(value.getDate() + 1);
    return formatDateValue(value);
  }, []);

  const locationOptions = useMemo(
    () => Array.from(new Set([itemLocation, ...COMMON_LOCATIONS])),
    [itemLocation]
  );

  const [meetingDate, setMeetingDate] = useState(tomorrow);
  const [timeSlot, setTimeSlot] = useState("");
  const [location, setLocation] = useState(itemLocation);
  const [locationDetail, setLocationDetail] = useState("");

  const canConfirm = Boolean(meetingDate && timeSlot && location);

  function handleConfirm() {
    if (!canConfirm) {
      return;
    }

    const selection = {
      meetingDate,
      timeSlot,
      location,
      locationDetail: locationDetail.trim(),
    };

    onConfirm?.(selection);
    toast.success("买家确认信息已保存", {
      description: `${formatDateLabel(meetingDate)} · ${timeSlot} · ${location}${
        selection.locationDetail ? `（${selection.locationDetail}）` : ""
      }`,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>买家确认订单</DialogTitle>
          <DialogDescription>
            请选择你希望的交易时间和见面地点，提交后可继续与卖家沟通细节。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-2xl border bg-muted/40 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold">{itemTitle}</p>
                <p className="text-xs text-muted-foreground">卖家：{sellerName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">意向价格</p>
                <p className="text-lg font-bold">¥{price}</p>
              </div>
            </div>
          </div>

          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">1. 选择见面日期</h3>
              <p className="text-xs text-muted-foreground">
                建议提前一天与卖家约定，便于双方安排时间。
              </p>
            </div>
            <Input
              min={tomorrow}
              type="date"
              value={meetingDate}
              onChange={(event) => setMeetingDate(event.target.value)}
            />
            {meetingDate && (
              <p className="text-xs text-primary">
                已选择：{formatDateLabel(meetingDate)}
              </p>
            )}
          </section>

          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">2. 选择时间段</h3>
              <p className="text-xs text-muted-foreground">
                选择一个你最方便的时间段，卖家确认后可进一步微调。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTimeSlot(slot)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm transition-colors",
                    timeSlot === slot
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">3. 选择交易地点</h3>
              <p className="text-xs text-muted-foreground">
                可先选一个常用地点，再补充更具体的集合位置。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {locationOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLocation(option)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    location === option
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-muted"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
            <Input
              placeholder="补充具体碰面点，例如：图书馆东门长椅旁"
              value={locationDetail}
              onChange={(event) => setLocationDetail(event.target.value)}
            />
          </section>

          <section className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm">
            <p className="font-semibold text-emerald-800">确认信息预览</p>
            <div className="mt-2 space-y-1 text-emerald-900">
              <p>
                交易时间：
                <span className="font-medium">
                  {meetingDate ? formatDateLabel(meetingDate) : "请选择日期"}
                  {timeSlot ? ` · ${timeSlot}` : ""}
                </span>
              </p>
              <p>
                交易地点：
                <span className="font-medium">
                  {location || "请选择地点"}
                  {locationDetail ? `（${locationDetail}）` : ""}
                </span>
              </p>
            </div>
          </section>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button disabled={!canConfirm} onClick={handleConfirm}>
            确认提交
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
