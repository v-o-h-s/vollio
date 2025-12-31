import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function DocumentNotFoundState() {
  const router = useRouter();

  return (
    <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
      <div className="flex flex-col items-center space-y-4 w-[400px]">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground">
            No Document Data
          </h3>
          <p className="text-sm text-muted-foreground mt-2 break-words">
            Unable to load the requested document.
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/documents")}
          variant="default"
          className="w-full gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Documents
        </Button>
      </div>
    </div>
  );
}
