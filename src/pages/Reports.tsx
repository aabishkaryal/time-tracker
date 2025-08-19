import { BarChart3, TrendingUp, Clock } from 'lucide-react';

export default function Reports() {
  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Analytics & Reports
          </h1>
          <p className="text-lg text-gray-600">
            Track your productivity and analyze your focus patterns
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Coming Soon Card 1 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Productivity Charts
              </h3>
              <p className="text-gray-600">
                Visual charts showing your daily, weekly, and monthly productivity trends.
              </p>
            </div>
          </div>

          {/* Coming Soon Card 2 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Time Breakdown
              </h3>
              <p className="text-gray-600">
                Detailed breakdown of time spent on different activities and projects.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Reports Coming Soon
            </h3>
            <p className="text-gray-600 leading-relaxed">
              We're building comprehensive analytics to help you understand your productivity patterns. 
              Start using the timer now, and your data will be ready when reports are available!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}