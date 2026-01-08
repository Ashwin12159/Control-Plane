import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, RefreshCw, Phone, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-2">
          Welcome to the Telecom Operations Control Plane
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              RabbitMQ
            </CardTitle>
            <CardDescription>
              Push messages to RabbitMQ queues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/rabbitmq">
              <Button className="w-full">Open RabbitMQ</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-500" />
              Check Sync
            </CardTitle>
            <CardDescription>
              Check synchronization status for entities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/check-sync">
              <Button className="w-full">Open Check Sync</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-500" />
              Numbers
            </CardTitle>
            <CardDescription>
              Lookup numbers not in Bifrost
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/numbers">
              <Button className="w-full">Open Numbers</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

