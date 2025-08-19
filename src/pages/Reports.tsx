import { BarChart3, TrendingUp, Clock } from 'lucide-react';

export default function Reports() {
  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <BarChart3 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Analytics & Reports
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your productivity and analyze your focus patterns
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Coming Soon Card 1 */}
          <div className="bg-card rounded-xl p-8 shadow-lg border border-border">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Productivity Charts
              </h3>
              <p className="text-muted-foreground">
                Visual charts showing your daily, weekly, and monthly productivity trends.
              </p>
            </div>
          </div>

          {/* Coming Soon Card 2 */}
          <div className="bg-card rounded-xl p-8 shadow-lg border border-border">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Time Breakdown
              </h3>
              <p className="text-muted-foreground">
                Detailed breakdown of time spent on different activities and projects.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-card rounded-xl p-8 shadow-lg border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Reports Coming Soon
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              We're building comprehensive analytics to help you understand your productivity patterns. 
              Start using the timer now, and your data will be ready when reports are available!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}