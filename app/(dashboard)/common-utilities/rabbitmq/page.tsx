"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRegion } from "@/components/dashboard/dashboard-layout";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formSchema = z.object({
  queueName: z.string().min(1, "Queue name is required"),
  payload: z.string().min(1, "Payload is required"),
});

type FormValues = z.infer<typeof formSchema>;

const samplePayloads = {
  practice: JSON.stringify(
    {
      type: "practice",
      practiceId: "PR123456",
      action: "sync",
      timestamp: new Date().toISOString(),
    },
    null,
    2
  ),
  location: JSON.stringify(
    {
      type: "location",
      locationId: "LOC789012",
      action: "update",
      data: {
        name: "Main Office",
        address: "123 Main St",
      },
    },
    null,
    2
  ),
  device: JSON.stringify(
    {
      type: "device",
      deviceId: "DEV345678",
      action: "register",
      metadata: {
        model: "iPhone 14",
        os: "iOS 17",
      },
    },
    null,
    2
  ),
};

export default function RabbitMQPage() {
  const { region } = useRegion();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<(() => void) | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      queueName: "",
      payload: "",
    },
  });

  const payload = watch("payload");

  const onSubmit = async (data: FormValues) => {
    setPendingSubmit(() => () => {
      performSubmit(data);
    });
    setShowConfirm(true);
  };

  const performSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setShowConfirm(false);

    try {
      const response = await fetch(`/api/grpc/${region}/push-queue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          queueName: data.queueName,
          payloadJson: data.payload,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to push to queue");
      }

      toast.success("Message pushed to queue successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to push to queue"
      );
    } finally {
      setIsLoading(false);
      setPendingSubmit(null);
    }
  };

  const handleSampleSelect = (sample: keyof typeof samplePayloads) => {
    setValue("payload", samplePayloads[sample]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">RabbitMQ Queue</h1>
        <p className="text-slate-400 mt-2">
          Push messages to RabbitMQ queues in {region} region
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Push to Queue</CardTitle>
          <CardDescription>
            Enter queue name and JSON payload to push
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="queueName">Queue Name</Label>
              <Input
                id="queueName"
                {...register("queueName")}
                placeholder="e.g., practice.sync"
                disabled={isLoading}
              />
              {errors.queueName && (
                <p className="text-sm text-red-500">
                  {errors.queueName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="payload">JSON Payload</Label>
                <Select
                  onValueChange={(value) =>
                    handleSampleSelect(value as keyof typeof samplePayloads)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sample Payloads" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="practice">Practice</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                    <SelectItem value="device">Device</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                id="payload"
                {...register("payload")}
                placeholder='{"key": "value"}'
                rows={12}
                className="font-mono text-sm"
                disabled={isLoading}
              />
              {errors.payload && (
                <p className="text-sm text-red-500">{errors.payload.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Pushing...
                </>
              ) : (
                "Push to Queue"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Operation</DialogTitle>
            <DialogDescription>
              You are about to push a message to the queue in the{" "}
              <strong>{region}</strong> region. Do you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirm(false);
                setPendingSubmit(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (pendingSubmit) {
                  pendingSubmit();
                }
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

