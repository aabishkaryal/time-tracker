import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <SettingsIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Settings
          </h1>
          <p className="text-lg text-gray-600">
            Customize your time tracking experience
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <SettingsIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Settings Panel Coming Soon
            </h3>
            <p className="text-gray-600 leading-relaxed">
              We're working on adding customizable settings for timer durations, 
              notifications, themes, and more. Check back soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}