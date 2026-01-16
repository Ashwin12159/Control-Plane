type Region = "AU-VOICESTACK" | "US-VOICESTACK" | "EU-VOICESTACK";

interface RegionConfig {
  baseUrl: string;
  hosts: string[];
}

const REGION_CONFIG: Record<Region, RegionConfig> = {
  "AU-VOICESTACK": {
    baseUrl: "https://uat.monitoring.csiq.io",
    hosts: ["UAT-SIPMEDIA1", "UAT-SIPMEDIA2", "UAT-SIPMEDIA3"],
  },
  "US-VOICESTACK": {
    baseUrl: "https://us.monitoring.csiq.io",
    hosts: ["US-SIP-MEDIA1"],
  },
  "EU-VOICESTACK": {
    baseUrl: "https://eu.monitoring.csiq.io",
    hosts: ["EU-SIP-MEDIA1", "EU-SIP-MEDIA2"],
  },
};

interface GenerateGrafanaUrlParams {
    region: Region;
    startTime: number;   // epoch ms
    endTime: number;     // epoch ms
    callId: string;
    filename?: string;
  }
  
  export function generateGrafanaExploreUrl({
    region,
    startTime,
    endTime,
    callId,
    filename = "/home/csiq/.pm2/logs/CallController-out.log",
  }: GenerateGrafanaUrlParams): string {
    const datasourceUid = "defe15basslj4e";
    const { baseUrl, hosts } = REGION_CONFIG[region];console.log("region", region);
    console.log("baseUrl", baseUrl);
    console.log("hosts", hosts);
  
    const hostExpr =
      hosts.length === 1
        ? `host="${hosts[0]}"`
        : `host=~"${hosts.join("|")}"`;
  
    const panes = {
      "85v": {
        datasource: datasourceUid,
        queries: [
          {
            refId: "A",
            expr: `{${hostExpr}, filename="${filename}"} |= \`${callId}\``,
            queryType: "range",
            datasource: {
              type: "loki",
              uid: datasourceUid,
            },
            editorMode: "builder",
            direction: "forward",
          },
        ],
        range: {
            // add a buffer of -5min and +5min to the start and end time
            from: String(startTime - 5 * 60 * 1000),
            to: String(endTime + 5 * 60 * 1000),
        },
      },
    };
  
    return (
      `${baseUrl}/explore` +
      `?schemaVersion=1` +
      `&panes=${encodeURIComponent(JSON.stringify(panes))}` +
      `&orgId=1`
    );
  }
  
