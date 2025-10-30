import { Dropdown } from "../Dropdown";

export const IndustriesDropdown = () => (
  <Dropdown title="Industries">
    <div className="space-y-2">
      <div className="px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
        <p className="text-sm font-medium text-gray-700">Small Business</p>
      </div>
      <div className="px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
        <p className="text-sm font-medium text-gray-700">Enterprise</p>
      </div>
      <div className="px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
        <p className="text-sm font-medium text-gray-700">Startups</p>
      </div>
    </div>
  </Dropdown>
);