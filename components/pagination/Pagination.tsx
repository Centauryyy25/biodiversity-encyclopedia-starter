'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

type PageLike = number | 'ellipsis';

interface SpeciesPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  className?: string;
}

export default function SpeciesPagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  className,
}: SpeciesPaginationProps) {
  const pages = buildPages(currentPage, totalPages);
  const isPrevDisabled = currentPage <= 1 || isLoading;
  const isNextDisabled = currentPage >= totalPages || isLoading;

  const linkClasses = (active?: boolean, disabled?: boolean) =>
    cn(
      'rounded-xl border border-[#8EB69B]/20 transition-colors duration-150',
      'text-[#DAF1DE] bg-[#163832]/50 hover:bg-[#2F5233] hover:text-[#DAF1DE]',
      active && 'bg-[#DAF1DE] text-[#163832] hover:text-[#163832] hover:bg-[#DAF1DE]',
      disabled && 'opacity-50 pointer-events-none'
    );

  return (
    <div className={cn('mt-12 flex justify-center', className)}>
      <div className="backdrop-blur-md bg-[#163832]/60 border border-[#8EB69B]/20 shadow-xl rounded-xl px-3 py-2">
        <Pagination className="mx-0">
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={isPrevDisabled}
                className={linkClasses(false, isPrevDisabled)}
                onClick={(event) => {
                  event.preventDefault();
                  if (isPrevDisabled) return;
                  onPageChange(currentPage - 1);
                }}
              />
            </PaginationItem>

            {pages.map((value, index) =>
              value === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis className="text-[#DAF1DE]/70" />
                </PaginationItem>
              ) : (
                <PaginationItem key={value}>
                  <PaginationLink
                    href="#"
                    isActive={value === currentPage}
                    className={linkClasses(value === currentPage, isLoading)}
                    aria-disabled={isLoading}
                    onClick={(event) => {
                      event.preventDefault();
                      if (isLoading || value === currentPage) return;
                      onPageChange(value);
                    }}
                  >
                    {value}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={isNextDisabled}
                className={linkClasses(false, isNextDisabled)}
                onClick={(event) => {
                  event.preventDefault();
                  if (isNextDisabled) return;
                  onPageChange(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

function buildPages(currentPage: number, totalPages: number): PageLike[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: PageLike[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    pages.push('ellipsis');
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < totalPages - 1) {
    pages.push('ellipsis');
  }

  pages.push(totalPages);
  return pages;
}
