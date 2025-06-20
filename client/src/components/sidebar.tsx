import { Link, useLocation } from "wouter";
import { 
  NetworkIcon, 
  GaugeIcon, 
  ServerIcon, 
  BrainIcon, 
  UsersIcon, 
  SettingsIcon, 
  FileTextIcon 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: GaugeIcon },
  { name: "API Management", href: "/apis", icon: ServerIcon },
  { name: "Model Aliases", href: "/models", icon: BrainIcon },
  { name: "User Management", href: "/users", icon: UsersIcon },
  { name: "Configuration", href: "/config", icon: SettingsIcon },
  { name: "Request Logs", href: "/logs", icon: FileTextIcon },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
        {/* Logo/Brand */}
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <NetworkIcon className="text-white w-4 h-4" />
            </div>
            <h1 className="ml-3 text-xl font-semibold text-gray-900">Proxy HUB</h1>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="mt-8 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? "bg-primary/10 border-r-2 border-primary text-primary"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon
                  className={`mr-3 w-4 h-4 ${
                    isActive ? "text-primary" : "text-gray-400"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
