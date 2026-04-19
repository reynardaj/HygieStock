'use client';

import * as React from 'react';
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  ChevronRight,
  Droplets,
  Container
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const mockTasks = [
  { id: '1', title: 'Refill Bathroom Soap', description: 'Upstairs and downstairs bathrooms', dueDate: 'Today', priority: 'High', type: 'refill' },
  { id: '2', title: 'Refill Kitchen Dispenser', description: 'Main kitchen sink', dueDate: 'Tomorrow', priority: 'Medium', type: 'refill' },
  { id: '3', title: 'Monthly Inventory Check', description: 'Scan all items in pantry', dueDate: 'In 3 days', priority: 'Low', type: 'check' },
];

export default function TasksPage() {
  const [tasks, setTasks] = React.useState(mockTasks);

  const completeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    toast.success("Task completed! Great job.");
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold tracking-tight">Refill Scheduler</h1>
            <p className="text-muted-foreground mt-2">Batch refill sessions to keep your home running smoothly.</p>
          </div>
          <Button className="rounded-xl px-6 shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock className="text-primary" size={20} />
                Upcoming Tasks
              </h2>
              {tasks.map((task) => (
                <Card key={task.id} className="border-none shadow-md hover:shadow-lg transition-all group">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        task.priority === 'High' ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                      )}>
                        {task.type === 'refill' ? <Droplets size={24} /> : <Container size={24} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{task.title}</h3>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="secondary" className="rounded-lg text-[10px] uppercase font-bold">
                            {task.dueDate}
                          </Badge>
                          <Badge variant="outline" className={cn(
                            "rounded-lg text-[10px] uppercase font-bold",
                            task.priority === 'High' ? "text-destructive border-destructive/20" : "text-muted-foreground"
                          )}>
                            {task.priority} Priority
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="rounded-xl hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                      onClick={() => completeTask(task.id)}
                    >
                      <CheckCircle2 size={20} />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-md bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-primary-foreground">Smart Suggestion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-primary-foreground/80">
                  Based on current stock levels, we recommend a batch refill session this weekend.
                </p>
                <div className="p-4 bg-white/10 rounded-xl space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-70">Recommended Date</p>
                  <p className="text-xl font-bold">Saturday, April 18</p>
                </div>
                <Button variant="secondary" className="w-full bg-white text-primary hover:bg-white/90 font-bold rounded-xl py-6">
                  Schedule Now
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Refill History</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: 'Bathroom Soap', date: 'Apr 5', user: 'Joshua' },
                  { title: 'Kitchen Dispenser', date: 'Mar 28', user: 'Reynard' },
                  { title: 'Laundry Refill', date: 'Mar 15', user: 'Joshua' },
                ].map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-medium">{h.title}</span>
                    </div>
                    <span className="text-muted-foreground">{h.date}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
