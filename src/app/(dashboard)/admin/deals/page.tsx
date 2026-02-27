"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  RefreshCw,
  Globe,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface Campaign {
  id: number;
  name: string;
  url: string;
  description: string;
  geo: string[];
  status: string;
}

interface Promo {
  id: number;
  name: string;
  type: string;
  code: string | null;
  landing_url: string;
  campaign_id: number;
  status: string;
}

export default function AdminDealsPage() {
  const { t } = useLanguage();
  const a = t.admin ?? {};

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [errorCampaigns, setErrorCampaigns] = useState<string | null>(null);
  const [errorPromos, setErrorPromos] = useState<string | null>(null);

  async function fetchCampaigns() {
    setLoadingCampaigns(true);
    setErrorCampaigns(null);
    try {
      const res = await fetch("/api/admin/campaigns");
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to fetch");
      }
      const data = await res.json();
      setCampaigns(data.campaigns ?? []);
    } catch (err) {
      setErrorCampaigns(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoadingCampaigns(false);
    }
  }

  async function fetchPromos() {
    setLoadingPromos(true);
    setErrorPromos(null);
    try {
      const res = await fetch("/api/admin/promos");
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to fetch");
      }
      const data = await res.json();
      setPromos(data.promos ?? []);
    } catch (err) {
      setErrorPromos(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoadingPromos(false);
    }
  }

  useEffect(() => {
    fetchCampaigns();
    fetchPromos();
  }, []);

  return (
    <div>
      <PageHeader title={a.casinoDeals ?? "Casino Deals"} />

      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">{a.campaigns ?? "Campaigns"}</TabsTrigger>
          <TabsTrigger value="promos">{a.promos ?? "Promos"}</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchCampaigns}
              disabled={loadingCampaigns}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loadingCampaigns ? "animate-spin" : ""}`}
              />
              {a.refreshData ?? "Refresh"}
            </Button>
          </div>

          {errorCampaigns && (
            <div className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {errorCampaigns}
            </div>
          )}

          {loadingCampaigns ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              {a.loading ?? "Loading..."}
            </div>
          ) : campaigns.length === 0 ? (
            <Card>
              <CardContent className="py-16">
                <p className="text-center text-muted-foreground">
                  {a.noData ?? "No data available"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-sm font-semibold text-foreground">
                        {campaign.name}
                      </h3>
                      <Badge
                        variant={
                          campaign.status === "active" ? "default" : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    {campaign.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {campaign.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {a.geo ?? "GEO"}:{" "}
                        {campaign.geo?.length > 0
                          ? campaign.geo.join(", ")
                          : "All"}
                      </span>
                    </div>
                    {campaign.url && (
                      <a
                        href={campaign.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {a.landingUrl ?? "Landing URL"}
                      </a>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-2">
                      ID: {campaign.id}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Promos Tab */}
        <TabsContent value="promos">
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchPromos}
              disabled={loadingPromos}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loadingPromos ? "animate-spin" : ""}`}
              />
              {a.refreshData ?? "Refresh"}
            </Button>
          </div>

          {errorPromos && (
            <div className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {errorPromos}
            </div>
          )}

          {loadingPromos ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              {a.loading ?? "Loading..."}
            </div>
          ) : promos.length === 0 ? (
            <Card>
              <CardContent className="py-16">
                <p className="text-center text-muted-foreground">
                  {a.noData ?? "No data available"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="px-4 py-3 font-medium text-muted-foreground">ID</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">
                          {a.campaignName ?? "Name"}
                        </th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">
                          {a.promoType ?? "Type"}
                        </th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">
                          {a.promoCode ?? "Code"}
                        </th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">
                          {a.status ?? "Status"}
                        </th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">
                          {a.landingUrl ?? "URL"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {promos.map((promo) => (
                        <tr
                          key={promo.id}
                          className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                            {promo.id}
                          </td>
                          <td className="px-4 py-3 text-foreground text-xs">
                            {promo.name}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-[10px]">
                              {promo.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-foreground font-mono text-xs">
                            {promo.code ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                promo.status === "active" ? "default" : "secondary"
                              }
                              className="text-[10px]"
                            >
                              {promo.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <a
                              href={promo.landing_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Link
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
