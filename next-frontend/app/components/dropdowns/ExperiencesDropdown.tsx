import { Dropdown } from "../Dropdown";

export const ExperiencesDropdown = () => (
  <Dropdown title="Experiences">
    <div className="space-y-2 space-x-3">
      <div className="px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
        <p className="text-sm font-medium text-gray-700">Customer Stories</p>
      </div>
      <div className="px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
        <p className="text-sm font-medium text-gray-700">Case Studies</p>
      </div>
    </div>
  </Dropdown>
);