"use client";

import { useState } from "react";
import { RouteProtection } from "@/components/route-protection";
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

type OperationType = "queue" | "exchange";

const formSchema = z.object({
  operationType: z.enum(["queue", "exchange"]),
  queueName: z.string().optional(),
  exchangeName: z.string().optional(),
  payload: z.string().min(1, "Payload is required"),
}).refine((data) => {
  if (data.operationType === "queue") {
    return data.queueName && data.queueName.length > 0;
  } else {
    return data.exchangeName && data.exchangeName.length > 0;
  }
}, {
  message: "Queue name or Exchange name is required",
  path: ["queueName"],
});

type FormValues = z.infer<typeof formSchema>;

const samplePayloads = {
  empty: "",
  mwi: JSON.stringify(
    {
      event: "mwi",
      endpoint: "ee2573daf434fb34c8af49fe90cb9@uat-metrowest.csiq.io",
      payload: {
        newVoicemailCount: 12,
        oldVoicemailCount: 0,
      },
    },
    null,
    2
  ),
  provision: JSON.stringify(
    {
      event: "provision",
      endpoint: "4016f19b0d2e4943aa155745ec4d873d@uat-metrowest.csiq.io",
      payload: {
        action: "yealink-check-cfg",
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
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operationType: "queue",
      queueName: "",
      exchangeName: "",
      payload: "",
    },
  });

  const operationType = watch("operationType");

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
      const endpoint = data.operationType === "queue" 
        ? `/api/v1/${region}/push-queue`
        : `/api/v1/${region}/broadcast-exchange`;
      
      const requestBody = data.operationType === "queue"
        ? {
            queueName: data.queueName,
            payloadJson: data.payload,
          }
        : {
            exchangeName: data.exchangeName,
            payloadJson: data.payload,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${data.operationType === "queue" ? "push to queue" : "broadcast to exchange"}`);
      }

      toast.success(
        data.operationType === "queue"
          ? "Message pushed to queue successfully"
          : "Message broadcast to exchange successfully"
      );
      // Reset form to default values
      reset({
        operationType: "queue",
        queueName: "",
        exchangeName: "",
        payload: "",
      });
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : `Failed to ${data.operationType === "queue" ? "push to queue" : "broadcast to exchange"}`
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
    <RouteProtection>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">RabbitMQ</h1>
        <p className="text-slate-400 mt-2">
          Push messages to RabbitMQ queues or broadcast to exchanges in {region} region
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>RabbitMQ Operations</CardTitle>
          <CardDescription>
            Choose to push to a queue or broadcast to an exchange
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="operationType">Operation Type</Label>
              <Select
                value={operationType}
                onValueChange={(value: OperationType) => {
                  setValue("operationType", value);
                  // Clear the other field when switching
                  if (value === "queue") {
                    setValue("exchangeName", "");
                  } else {
                    setValue("queueName", "");
                  }
                }}
              >
                <SelectTrigger id="operationType" className="w-full">
                  <SelectValue placeholder="Select operation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="queue">Push to Queue</SelectItem>
                  <SelectItem value="exchange">Broadcast to Exchange</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {operationType === "queue" ? (
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
            ) : (
              <div className="space-y-2">
                <Label htmlFor="exchangeName">Exchange Name</Label>
                <Input
                  id="exchangeName"
                  {...register("exchangeName")}
                  placeholder="e.g., events.exchange"
                  disabled={isLoading}
                />
                {errors.exchangeName && (
                  <p className="text-sm text-red-500">
                    {errors.exchangeName.message}
                  </p>
                )}
              </div>
            )}

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
                    <SelectItem value="empty">Empty</SelectItem>
                    <SelectItem value="mwi">MWI</SelectItem>
                    <SelectItem value="provision">Provision</SelectItem>
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
                  {operationType === "queue" ? "Pushing..." : "Broadcasting..."}
                </>
              ) : (
                operationType === "queue" ? "Push to Queue" : "Broadcast to Exchange"
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
              You are about to {watch("operationType") === "queue" ? "push a message to the queue" : "broadcast a message to the exchange"} in the{" "}
              <strong>{region}</strong> region.
              {watch("operationType") === "queue" && watch("queueName") && (
                <>
                  <br />
                  <br />
                  Queue: <strong>{watch("queueName")}</strong>
                </>
              )}
              {watch("operationType") === "exchange" && watch("exchangeName") && (
                <>
                  <br />
                  <br />
                  Exchange: <strong>{watch("exchangeName")}</strong>
                </>
              )}
              <br />
              <br />
              Do you want to continue?
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
    </RouteProtection>
  );
}

