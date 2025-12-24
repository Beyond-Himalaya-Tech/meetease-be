import { notFoundResponse } from "./response.helper";

export function paginateData(data, total: number, currentPage: number = 1, pageSize: number = 10) {
  const totalPage = Math.ceil(total / pageSize);

  if (currentPage > totalPage) {
    throw notFoundResponse(`No  Data in page ${currentPage}`);
  }

  return {
    data,
    meta: {
      total,
      totalPage,
      currentPage,
      totalPerPage: pageSize,
      prevPage: currentPage > 1 ? currentPage - 1 : null,
      nextPage: currentPage < totalPage ? currentPage + 1 : null,
    },
  };
};