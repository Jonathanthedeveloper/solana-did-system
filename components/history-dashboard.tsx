"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  X,
  Search,
  Eye,
  Download,
  Calendar,
  TrendingUp,
  Shield,
  AlertTriangle,
  Clock,
  Activity,
  BarChart3,
  FileCheck,
  FileX,
  Send,
  Receipt,
} from "lucide-react";
import { useActivityHistory } from "@/features/activity-history";

export function HistoryDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [lastViewed, setLastViewed] = useState(new Date());
  const { data: activities = [], isLoading, error } = useActivityHistory();

  // Mock real-time activity updates
  const recentActivities = activities.filter(
    (activity) => new Date(activity.timestamp) > lastViewed
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "credential_issued":
        return <FileCheck className="w-4 h-4 text-green-600" />;
      case "credential_revoked":
        return <FileX className="w-4 h-4 text-red-600" />;
      case "credential_received":
        return <Receipt className="w-4 h-4 text-blue-600" />;
      case "verification_completed":
        return <Shield className="w-4 h-4 text-blue-600" />;
      case "verification_failed":
        return <X className="w-4 h-4 text-red-600" />;
      case "proof_request_created":
        return <Send className="w-4 h-4 text-purple-600" />;
      case "proof_response_submitted":
        return <Receipt className="w-4 h-4 text-green-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "credential_issued":
        return "default";
      case "credential_revoked":
        return "destructive";
      case "credential_received":
        return "secondary";
      case "verification_completed":
        return "secondary";
      case "verification_failed":
        return "destructive";
      case "proof_request_created":
        return "outline";
      case "proof_response_submitted":
        return "default";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "error":
        return <X className="w-4 h-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.target.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || activity.type === filterType;

    const now = new Date();
    const activityDate = new Date(activity.timestamp);
    let matchesPeriod = true;

    if (filterPeriod === "today") {
      matchesPeriod = activityDate.toDateString() === now.toDateString();
    } else if (filterPeriod === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesPeriod = activityDate >= weekAgo;
    } else if (filterPeriod === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesPeriod = activityDate >= monthAgo;
    }

    return matchesSearch && matchesType && matchesPeriod;
  });

  const stats = {
    total: activities.length,
    issued: activities.filter((a) => a.type === "credential_issued").length,
    verified: activities.filter((a) => a.type === "verification_completed")
      .length,
    failed: activities.filter((a) => a.status === "error").length,
    requests: activities.filter((a) => a.type.includes("proof")).length,
  };

  const formatActivityType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getActivityTrend = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayCount = activities.filter(
      (a) => new Date(a.timestamp).toDateString() === today.toDateString()
    ).length;

    const yesterdayCount = activities.filter(
      (a) => new Date(a.timestamp).toDateString() === yesterday.toDateString()
    ).length;

    if (todayCount > yesterdayCount) {
      return {
        trend: "up",
        percentage: Math.round(
          ((todayCount - yesterdayCount) / yesterdayCount) * 100
        ),
      };
    } else if (todayCount < yesterdayCount) {
      return {
        trend: "down",
        percentage: Math.round(
          ((yesterdayCount - todayCount) / yesterdayCount) * 100
        ),
      };
    }
    return { trend: "stable", percentage: 0 };
  };

  const trend = getActivityTrend();

  const exportActivities = (format: "csv" | "json") => {
    const dataToExport = filteredActivities.map((activity) => ({
      id: activity.id,
      type: formatActivityType(activity.type),
      title: activity.title,
      description: activity.description,
      actor: activity.actor,
      target: activity.target,
      status: activity.status,
      timestamp: activity.timestamp,
      details: activity.details,
    }));

    if (format === "json") {
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `activity-history-${
        new Date().toISOString().split("T")[0]
      }.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV export
      const headers = [
        "ID",
        "Type",
        "Title",
        "Description",
        "Actor",
        "Target",
        "Status",
        "Timestamp",
      ];
      const csvContent = [
        headers.join(","),
        ...dataToExport.map((activity) =>
          [
            activity.id,
            activity.type,
            `"${activity.title}"`,
            `"${activity.description}"`,
            activity.actor,
            activity.target,
            activity.status,
            activity.timestamp,
          ].join(",")
        ),
      ].join("\n");

      const dataBlob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `activity-history-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const markAsViewed = () => {
    setLastViewed(new Date());
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-8">
          <Activity className="w-8 h-8 animate-spin mr-2" />
          <span>Loading activity history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-8">
          <AlertTriangle className="w-8 h-8 text-red-600 mr-2" />
          <span>Error loading activity history</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Activity History
          </h1>
          <p className="text-muted-foreground">
            Comprehensive view of all system activities and transactions
          </p>
        </div>
        <div className="flex gap-2">
          {recentActivities.length > 0 && (
            <Button
              variant="outline"
              className="gap-2 relative"
              onClick={markAsViewed}
            >
              <div className="relative">
                <Activity className="w-4 h-4" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </div>
              {recentActivities.length} New
            </Button>
          )}
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => exportActivities("csv")}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => exportActivities("json")}
          >
            <Download className="w-4 h-4" />
            Export JSON
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => exportActivities("json")}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Activities
            </CardTitle>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              {trend.trend === "up" && (
                <TrendingUp className="w-4 h-4 text-green-600" />
              )}
              {trend.trend === "down" && (
                <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {trend.trend === "up" && `+${trend.percentage}% from yesterday`}
              {trend.trend === "down" && `-${trend.percentage}% from yesterday`}
              {trend.trend === "stable" && "No change from yesterday"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Credentials Issued
            </CardTitle>
            <FileCheck className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.issued}</div>
            <p className="text-xs text-muted-foreground">
              Successful issuances
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verifications</CardTitle>
            <Shield className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">Completed checks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Failed Activities
            </CardTitle>
            <X className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">Errors & failures</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Proof Requests
            </CardTitle>
            <Send className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.requests}</div>
            <p className="text-xs text-muted-foreground">Created & responded</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credential_issued">
                  Credential Issued
                </SelectItem>
                <SelectItem value="credential_received">
                  Credential Received
                </SelectItem>
                <SelectItem value="credential_revoked">
                  Credential Revoked
                </SelectItem>
                <SelectItem value="verification_completed">
                  Verification Completed
                </SelectItem>
                <SelectItem value="verification_failed">
                  Verification Failed
                </SelectItem>
                <SelectItem value="proof_request_created">
                  Proof Request Created
                </SelectItem>
                <SelectItem value="proof_response_submitted">
                  Proof Response Submitted
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity Views */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Activity List Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity List</CardTitle>
              <CardDescription>
                Detailed table view of all system activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredActivities.length > 0 ? (
                <div className="space-y-4">
                  {filteredActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {activity.title}
                          </h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            {activity.actor} → {activity.target}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(activity.status)}
                          <Badge
                            variant={getActivityColor(activity.type)}
                            className="text-xs"
                          >
                            {formatActivityType(activity.type)}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedActivity(activity)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No activities found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          {/* Timeline View */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Timeline</CardTitle>
              <CardDescription>
                Chronological timeline of all system activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredActivities.length > 0 ? (
                  filteredActivities
                    .sort(
                      (a, b) =>
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime()
                    )
                    .map((activity, index) => (
                      <div key={activity.id} className="relative">
                        {/* Timeline line */}
                        {index < filteredActivities.length - 1 && (
                          <div className="absolute left-6 top-12 w-0.5 h-full bg-border" />
                        )}

                        <div className="flex items-start space-x-4">
                          {/* Timeline dot */}
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                            {getActivityIcon(activity.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pb-8">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-foreground">
                                {activity.title}
                              </h4>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(activity.status)}
                                <Badge
                                  variant={getActivityColor(activity.type)}
                                >
                                  {formatActivityType(activity.type)}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {activity.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-muted-foreground">
                                <span className="font-medium">
                                  {activity.actor}
                                </span>
                                {" → "}
                                <span className="font-medium">
                                  {activity.target}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(activity.timestamp).toLocaleString()}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2"
                              onClick={() => setSelectedActivity(activity)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No activities in timeline
                    </h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Activity Details Dialog */}
      <Dialog
        open={!!selectedActivity}
        onOpenChange={() => setSelectedActivity(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedActivity && getActivityIcon(selectedActivity.type)}
              {selectedActivity?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedActivity?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedActivity && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Activity Type</label>
                  <p className="text-sm text-muted-foreground">
                    {formatActivityType(selectedActivity.type)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedActivity.status)}
                    <span className="text-sm text-muted-foreground capitalize">
                      {selectedActivity.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Actor</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedActivity.actor}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Target</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedActivity.target}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Timestamp</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedActivity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedActivity.details && (
                <div>
                  <label className="text-sm font-medium">Details</label>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {JSON.stringify(selectedActivity.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
