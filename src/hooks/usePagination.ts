import { useState, useMemo } from 'react';
import type { Product } from '../types/Product';

interface UsePaginationProps {
  items: Product[];
  itemsPerPage: number;
}

export const usePagination = ({ items, itemsPerPage }: UsePaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
  };
}; 