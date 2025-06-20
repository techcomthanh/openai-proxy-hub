import { Link, useLocation } from "wouter";
import { 
  NetworkIcon, 
  GaugeIcon, 
  ServerIcon, 
  BrainIcon, 
  UsersIcon, 
  SettingsIcon, 
  FileTextIcon,
  XIcon
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: GaugeIcon },
  { name: "API Management", href: "/apis", icon: ServerIcon },
  { name: "Model Aliases", href: "/models", icon: BrainIcon },
  { name: "User Management", href: "/users", icon: UsersIcon },
  { name: "Configuration", href: "/config", icon: SettingsIcon },
  { name: "Request Logs", href: "/logs", icon: FileTextIcon },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className="w-64 flex flex-col">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
        {/* Logo/Brand */}
        <div className="flex items-center justify-between flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <NetworkIcon className="text-white w-4 h-4" />
            </div>
            <h1 className="ml-3 text-xl font-semibold text-gray-900">OpenAI Proxy HUB</h1>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <XIcon className="w-5 h-5" />
            </button>
          )}
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
                onClick={onClose}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? "bg-primary bg-opacity-10 border-r-2 border-primary text-primary"
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
