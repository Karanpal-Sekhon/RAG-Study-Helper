import { Card, CardContent } from "@/components/ui/card";
import { Image } from "lucide-react";

const ResourcesSection = ({ workspaceId }) => {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
      <div className="text-center mt-20">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Image className="h-8 w-8 text-indigo-600" />
        </div>
        <p className="text-xl font-semibold text-gray-900 mb-2">Resources Section</p>
        <p className="text-gray-600">Generate and manage study resources.</p>
        <p className="text-sm text-gray-500 mt-2">Workspace ID: {workspaceId}</p>
      </div>
    </div>
  );
};

export default ResourcesSection;