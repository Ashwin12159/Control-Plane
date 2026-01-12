"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function TwilioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Twilio Operations</h1>
        <p className="text-slate-400 mt-2">
          Twilio-specific operations and tools
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-yellow-500" />
            Coming Soon
          </CardTitle>
          <CardDescription>
            Twilio operations will be available here soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Construction className="h-16 w-16 text-yellow-500 mb-4" />
            <p className="text-lg font-medium text-white mb-2">
              Twilio Operations
            </p>
            <p className="text-sm text-slate-400">
              This section is under development and will be available soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

