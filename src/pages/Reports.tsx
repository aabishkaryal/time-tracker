import { BarChart3, TrendingUp, Calendar, Target, PieChart } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export default function Reports() {
  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <BarChart3 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            Insights and analytics for your productivity patterns
          </p>
        </div>

        {/* Coming Soon Content */}
        <div className="space-y-6">
          {/* Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-dashed border-2 opacity-70 hover:opacity-80 transition-opacity">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Productivity Trends
                </CardTitle>
                <CardDescription>
                  Track your productivity patterns over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 text-primary/60 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">Chart Preview</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed border-2 opacity-70 hover:opacity-80 transition-opacity">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  Time Distribution
                </CardTitle>
                <CardDescription>
                  See how you spend time across activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gradient-to-br from-warning/5 to-warning/10 rounded-lg flex items-center justify-center border border-warning/20">
                  <div className="text-center">
                    <PieChart className="w-8 h-8 text-warning/60 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">Pie Chart Preview</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed border-2 opacity-70 hover:opacity-80 transition-opacity">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Weekly Summary
                </CardTitle>
                <CardDescription>
                  Weekly breakdown of sessions and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gradient-to-br from-green-500/5 to-green-500/10 rounded-lg flex items-center justify-center border border-green-500/20">
                  <div className="text-center">
                    <Calendar className="w-8 h-8 text-green-500/60 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">Calendar Preview</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed border-2 opacity-70 hover:opacity-80 transition-opacity">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Goal Tracking
                </CardTitle>
                <CardDescription>
                  Set and track productivity goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gradient-to-br from-purple-500/5 to-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
                  <div className="text-center">
                    <Target className="w-8 h-8 text-purple-500/60 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">Progress Preview</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Coming Soon Message */}
          <Card className="text-center py-12 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent>
              <div className="max-w-md mx-auto space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 border-4 border-primary/20">
                  <BarChart3 className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">
                  Coming Soon
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Comprehensive reports and analytics are in development. 
                  Keep using the timer to build your data history!
                </p>
                <div className="bg-card/60 rounded-lg p-6 mt-8">
                  <h3 className="font-semibold text-foreground mb-4">
                    What's Coming
                  </h3>
                  <ul className="text-left text-muted-foreground space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Productivity trends and patterns over time
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-warning rounded-full"></div>
                      Time distribution across activities
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Goal setting and progress tracking
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}