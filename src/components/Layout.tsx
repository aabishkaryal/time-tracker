import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <div className="flex items-center py-4">
              <h2 className="text-xl font-semibold">Time Tracker</h2>
            </div>
            
            <div className="flex space-x-8">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `py-4 px-2 border-b-2 font-medium text-sm ${
                    isActive 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`
                }
                end
              >
                Timer
              </NavLink>
              
              <NavLink 
                to="/reports" 
                className={({ isActive }) => 
                  `py-4 px-2 border-b-2 font-medium text-sm ${
                    isActive 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`
                }
              >
                Reports
              </NavLink>
              
              <NavLink 
                to="/settings" 
                className={({ isActive }) => 
                  `py-4 px-2 border-b-2 font-medium text-sm ${
                    isActive 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`
                }
              >
                Settings
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}