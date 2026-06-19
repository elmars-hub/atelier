import { Button } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  page,
  total,
  limit,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-atelier-stone">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="cursor-pointer"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="cursor-pointer"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
