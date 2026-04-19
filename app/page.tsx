'use client';

import * as React from 'react';
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  ShoppingCart,
  ArrowUpRight,
  Package
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { motion } from 'motion/react';

const mockStats = [
  { title: 'Total Items', value: '42', icon: Package, color: 'text-blue-500' },
  { title: 'Low Stock', value: '5', icon: AlertTriangle, color: 'text-amber-500' },
  { title: 'Out of Stock', value: '2', icon: TrendingDown, color: 'text-destructive' },
  { title: 'Tasks Due', value: '3', icon: Clock, color: 'text-emerald-500' },
];

const mockUsageData = [
  { name: 'Mon', usage: 4 },
  { name: 'Tue', usage: 3 },
  { name: 'Wed', usage: 6 },
  { name: 'Thu', usage: 2 },
  { name: 'Fri', usage: 5 },
  { name: 'Sat', usage: 8 },
  { name: 'Sun', usage: 4 },
];

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight">Household Overview</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here&apos;s what&apos;s happening in your home.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {mockStats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={stat.color} size={20} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Usage Chart */}
          <Card className="lg:col-span-4 border-none shadow-md">
            <CardHeader>
              <CardTitle>Consumption Trends</CardTitle>
              <CardDescription>Daily item usage over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockUsageData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="usage" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Effort Widget */}
          <Card className="lg:col-span-3 border-none shadow-md bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-primary-foreground">Effort Needed This Month</CardTitle>
              <CardDescription className="text-primary-foreground/70">Predicted workload for replenishment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-3xl font-bold">~30 mins</p>
                  <p className="text-sm text-primary-foreground/70">Total estimated time</p>
                </div>
                <div className="p-3 bg-white/20 rounded-2xl">
                  <TrendingDown size={32} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>1 Shopping Trip</span>
                  <Badge variant="secondary" className="bg-white/20 text-white border-none">~20 mins</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>2 Refill Sessions</span>
                  <Badge variant="secondary" className="bg-white/20 text-white border-none">~10 mins</Badge>
                </div>
              </div>
              <Button variant="secondary" className="w-full bg-white text-primary hover:bg-white/90 font-bold py-6 rounded-xl">
                View Schedule
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alerts */}
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Low Stock Alerts</CardTitle>
              <CardDescription>Items that need your attention soon</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Generate Shopping List
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Liquid Hand Soap', brand: 'Lifebuoy', stock: '15%', location: 'Kitchen' },
                { name: 'Dishwashing Liquid', brand: 'Sunlight', stock: '8%', location: 'Pantry' },
                { name: 'Shampoo', brand: 'Pantene', stock: '22%', location: 'Upstairs Bathroom' },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.brand} • {item.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-bold",
                      parseInt(item.stock) < 10 ? "text-destructive" : "text-amber-500"
                    )}>{item.stock}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Remaining</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
