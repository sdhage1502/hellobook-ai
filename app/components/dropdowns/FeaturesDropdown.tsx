import { Dropdown } from "../Dropdown";
import {
  Layout,
  BarChart3,
  MessageSquare,
  FileText,
  DollarSign,
  Bug,
  Cloud,
  ListTodo,
  ScanLine,
} from "lucide-react";

export const FeaturesDropdown = () => {
  const items = [
    { 
      icon: <Layout className="w-5 h-5 text-blue-500" />, 
      title: "Categorization", 
      desc: "Use AI to automatically categorize" 
    },
    { 
      icon: <Layout className="w-5 h-5 text-blue-500" />, 
      title: "Clean Up", 
      desc: "Optimize processes" 
    },
    { 
      icon: <BarChart3 className="w-5 h-5 text-blue-500" />, 
      title: "Scalable", 
      desc: "Support businesses of all sizes" 
    },
    { 
      icon: <MessageSquare className="w-5 h-5 text-blue-500" />, 
      title: "Chat Feature", 
      desc: "Get help and support instantly" 
    },
    { 
      icon: <FileText className="w-5 h-5 text-blue-500" />, 
      title: "Advance Reporting", 
      desc: "Generate detailed reports with AI" 
    },
    { 
      icon: <DollarSign className="w-5 h-5 text-blue-500" />, 
      title: "Taxation & Auditing", 
      desc: "Keep your financial records organized" 
    },
    { 
      icon: <Bug className="w-5 h-5 text-blue-500" />, 
      title: "Easy Debug", 
      desc: "Quickly identify and fix errors" 
    },
    { 
      icon: <Cloud className="w-5 h-5 text-blue-500" />, 
      title: "Cloud Feature", 
      desc: "Securely store your files on the cloud" 
    },
    { 
      icon: <ListTodo className="w-5 h-5 text-blue-500" />, 
      title: "Task Manager", 
      desc: "Manage communications and tasks" 
    },
    { 
      icon: <ScanLine className="w-5 h-5 text-blue-500" />, 
      title: "OCR Scanning", 
      desc: "Bill Matching/ Scanning With AI" 
    },
  ];

  return (
    <Dropdown title="Features">
      <div className="w-[800px] p-6">
        <div className="grid grid-cols-2 gap-2">
          {items.map((it, i) => (
            <div
              key={i}
              className="flex items-start space-x-3 p-4 rounded-lg hover:bg-blue-50 cursor-pointer transition-all duration-200 hover:scale-[1.02] group"
            >
              <div className="shrink-0 mt-0.5">
                {it.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                  {it.title}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {it.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Dropdown>
  );
};