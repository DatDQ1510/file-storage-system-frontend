  // import type { IStorageSummary } from "@/types/dashboard";
  // import { Cloud } from "lucide-react";
  // import { Button } from "@/components/ui/button";

  // interface IStorageSummaryCardProps {
  //   storage: IStorageSummary;
  // }

  // export const StorageSummaryCard = ({
  //   storage,
  // }: IStorageSummaryCardProps) => {
  //   return (
  //     <div className="rounded-lg border border-blue-600 bg-blue-600 p-6 text-white">
  //       <div className="flex items-start justify-between">
  //         <div className="flex gap-2">
  //           <Cloud className="h-8 w-8" />
  //           <div>
  //             <h3 className="text-lg font-semibold">Vault Cloud</h3>
  //             <p className="text-sm text-blue-100">Storage Status</p>
  //           </div>
  //         </div>
  //       </div>

  //       <div className="mt-6 space-y-4">
  //         <div>
  //           <p className="text-sm text-blue-100">Used Space</p>
  //           <p className="text-2xl font-bold">{storage.usedSpace}</p>
  //           <p className="text-xs text-blue-100">of {storage.totalSpace}</p>
  //         </div>

  //         {/* Progress Bar */}
  //         <div className="space-y-2">
  //           <div className="h-2 w-full overflow-hidden rounded-full bg-blue-500">
  //             <div
  //               className="h-full bg-white"
  //               style={{ width: `${storage.percentUsed}%` }}
  //             />
  //           </div>
  //           <p className="text-xs text-blue-100">
  //             {storage.percentUsed}% used
  //           </p>
  //         </div>

  //         {/* Storage Breakdown */}
  //         <div className="grid grid-cols-2 gap-3 border-t border-blue-500 pt-4">
  //           <div>
  //             <p className="text-xs text-blue-100">MEDIA</p>
  //             <p className="font-semibold">{storage.media}</p>
  //           </div>
  //           <div>
  //             <p className="text-xs text-blue-100">DOCS</p>
  //             <p className="font-semibold">{storage.docs}</p>
  //           </div>
  //         </div>

  //         {/* Upgrade Button */}
  //         <Button
  //           className="w-full bg-white text-blue-600 hover:bg-blue-50"
  //           size="sm"
  //         >
  //           Upgrade Capacity
  //         </Button>
  //       </div>
  //     </div>
  //   );
  // };
