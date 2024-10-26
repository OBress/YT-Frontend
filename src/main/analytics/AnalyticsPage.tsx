import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Sample analytics data
const analyticsData = [
  { name: "Main Channel", views: 1000, likes: 500, comments: 100 },
  { name: "Secondary Channel", views: 750, likes: 300, comments: 50 },
];

export default function AnalyticsPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-3xl">Channel Analytics</CardTitle>
        <CardDescription className="text-lg">
          Overview of views, likes, and comments for each channel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            views: {
              label: "Views",
              color: "hsl(var(--chart-1))",
            },
            likes: {
              label: "Likes",
              color: "hsl(var(--chart-2))",
            },
            comments: {
              label: "Comments",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[600px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="views" fill="var(--color-views)" />
              <Bar dataKey="likes" fill="var(--color-likes)" />
              <Bar dataKey="comments" fill="var(--color-comments)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
