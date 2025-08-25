import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
	return (
		<Card>
			<CardHeader>
				<CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-[90%]" />
				<Skeleton className="h-4 w-[85%]" />
				<Skeleton className="h-4 w-[80%]" />
			</CardContent>
		</Card>
	);
} 