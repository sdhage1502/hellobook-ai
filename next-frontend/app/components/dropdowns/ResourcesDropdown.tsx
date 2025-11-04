import { Dropdown } from "../Dropdown";

export const ResourcesDropdown = () => (
  <Dropdown title="Resources">
    <div className="space-y-2">
      <div className="px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
        <p className="text-sm font-medium text-gray-700">Blog</p>
      </div>
      <div className="px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
        <p className="text-sm font-medium text-gray-700">Documentation</p>
      </div>
      <div className="px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
        <p className="text-sm font-medium text-gray-700">Help Center</p>
      </div>
    </div>
  </Dropdown>
);