import { useEffect, useMemo, useState } from "react";
import type { Customer } from "./types";
import type { EventType, PaginationMeta } from "../../lib/api";

type ColumnId = "name" | "email" | "phone" | "tag";

const allColumns: { id: ColumnId; label: string; always?: boolean }[] = [
  { id: "name", label: "Name", always: true },
  { id: "email", label: "Email" },
  { id: "phone", label: "Number" },
  { id: "tag", label: "Tag" },
];

const STORAGE_KEY = "customersTableColumns";

type AppliedFiltersType = {
  hasPhone: boolean;
  eventType: number | null;
};

type CustomersListProps = {
  customers: Customer[];
  eventTypes: EventType[];
  appliedFilters: AppliedFiltersType;
  onApplyFilters: (filters: AppliedFiltersType) => void;
  paginationMeta?: PaginationMeta;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
};


const CustomersList = ({
  customers,
  eventTypes,
  appliedFilters,
  onApplyFilters,
  paginationMeta,
  onPageChange,
  onEdit,
  onDelete,
}: CustomersListProps) => {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  
  // Pending filters (what user is selecting, not yet applied)
  // Initialize from appliedFilters
  const [pendingFilters, setPendingFilters] = useState<AppliedFiltersType>(appliedFilters);
  const [eventFilter, setEventFilter] = useState<string>(
    appliedFilters.eventType ? String(appliedFilters.eventType) : "all"
  );
  
  // Sync pending filters when filter panel opens
  const handleFilterToggle = () => {
    if (!filterOpen) {
      // Opening filter panel - sync with current applied filters
      setPendingFilters(appliedFilters);
      setEventFilter(appliedFilters.eventType ? String(appliedFilters.eventType) : "all");
    }
    setFilterOpen((open) => !open);
  };

  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnId, boolean>>(
    () => {
      const base: Record<ColumnId, boolean> = {
        name: true,
        email: true,
        phone: true,
        tag: true,
      };
      if (typeof window === "undefined") return base;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return base;
        const parsed = JSON.parse(raw) as Partial<Record<ColumnId, boolean>>;
        return { ...base, ...parsed };
      } catch {
        return base;
      }
    },
  );
  const [pendingColumns, setPendingColumns] =
    useState<Record<ColumnId, boolean> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const toStore: Partial<Record<ColumnId, boolean>> = { ...visibleColumns };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  }, [visibleColumns]);

  // Use event types from props (from backend)

  // Only filter by search on frontend (backend handles hasPhone and eventType)
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return customers.filter((c) => {
      const matchesSearch =
        !term ||
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.company.toLowerCase().includes(term);
      
      return matchesSearch;
    });
  }, [customers, search]);

  // Use backend pagination meta if available, otherwise use frontend pagination for search
  const totalPages = paginationMeta?.totalPage || 1;
  const totalItems = paginationMeta?.total || filtered.length;
  const startIndex = paginationMeta
    ? (paginationMeta.currentPage - 1) * paginationMeta.totalPerPage
    : 0;
  const currentRows = filtered;

  const clearAllFilters = () => {
    setPendingFilters({
      hasPhone: false,
      eventType: null,
    });
    setEventFilter("all");
    onPageChange(1);
  };

  const handleApplyFilters = () => {
    const eventTypeValue = eventFilter === "all" ? null : parseInt(eventFilter, 10);
    onApplyFilters({
      hasPhone: pendingFilters.hasPhone,
      eventType: eventTypeValue || null,
    });
    setFilterOpen(false);
    onPageChange(1);
  };

  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-col gap-3 px-4 sm:px-6 py-3 border-b border-gray-200 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Customers</h2>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <input
            type="search"
            placeholder="Search name, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              // Search is frontend-only, so we don't reset backend pagination
            }}
            className="w-40 sm:w-56 rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="relative">
            <button
              type="button"
              className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1"
              onClick={handleFilterToggle}
            >
              Filter
              <span className="text-[10px]">
                {filterOpen ? "▲" : "▼"}
              </span>
            </button>
            {filterOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-gray-200 bg-white z-20">
                <div className="max-h-80 overflow-y-auto px-4 pt-4 pb-3 space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Phone number
                    </p>
                    <label className="mt-2 flex items-center gap-2 text-xs text-gray-700">
                      <input
                        type="checkbox"
                        checked={pendingFilters.hasPhone}
                        onChange={() =>
                          setPendingFilters((prev) => ({
                            ...prev,
                            hasPhone: !prev.hasPhone,
                          }))
                        }
                        className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Has phone number
                    </label>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Event type
                    </p>
                    <select
                      value={eventFilter}
                      onChange={(e) => {
                        setEventFilter(e.target.value);
                        // Update pending filter but don't apply yet
                        const eventTypeValue = e.target.value === "all" ? null : parseInt(e.target.value, 10);
                        setPendingFilters((prev) => ({
                          ...prev,
                          eventType: eventTypeValue || null,
                        }));
                      }}
                      className="mt-2 w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All event types</option>
                      {eventTypes.map((et) => (
                        <option key={et.id} value={et.id}>
                          {et.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-gray-200 px-4 py-3">
                  <button
                    type="button"
                    className="rounded-full border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    onClick={clearAllFilters}
                  >
                    Clear all
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-blue-600 px-5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                    onClick={handleApplyFilters}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1"
              onClick={() => {
                setColumnsOpen((open) => {
                  const next = !open;
                  if (next) {
                    setPendingColumns(visibleColumns);
                  } else {
                    setPendingColumns(null);
                  }
                  return next;
                });
              }}
            >
              Columns
              <span className="text-[10px]">
                {columnsOpen ? "▲" : "▼"}
              </span>
            </button>
            {columnsOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-200 bg-white z-20">
                <div className="px-4 pt-4 pb-2 space-y-2">
                  <p className="text-xs font-semibold text-gray-900">
                    Columns
                  </p>
                  <ul className="max-h-64 overflow-auto text-sm text-gray-800 space-y-1.5">
                    {allColumns.map((col) => {
                      const current = pendingColumns ?? visibleColumns;
                      const checked = current[col.id] ?? true;
                      return (
                        <li
                          key={col.id}
                          className="flex items-center gap-3"
                        >
                          <input
                            id={`col-${col.id}`}
                            type="checkbox"
                            checked={checked}
                            disabled={col.always}
                            onChange={() => {
                              if (col.always) return;
                              setPendingColumns((prev) => {
                                const base = prev ?? visibleColumns;
                                return {
                                  ...base,
                                  [col.id]: !base[col.id],
                                };
                              });
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`col-${col.id}`}
                            className={`text-sm ${
                              col.always
                                ? "text-gray-400"
                                : "cursor-pointer"
                            }`}
                          >
                            {col.label}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="border-t border-gray-200 px-4 py-3">
                  <button
                    type="button"
                    className="w-full rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                    onClick={() => {
                      if (pendingColumns) {
                        setVisibleColumns(pendingColumns);
                      }
                      setColumnsOpen(false);
                      setPendingColumns(null);
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 sm:px-6 py-2">#</th>
              {visibleColumns.name && (
                <th className="px-4 sm:px-6 py-2">Name</th>
              )}
              {visibleColumns.email && (
                <th className="px-4 sm:px-6 py-2">Email</th>
              )}
              {visibleColumns.phone && (
                <th className="px-4 sm:px-6 py-2">Number</th>
              )}
              {visibleColumns.tag && (
                <th className="px-4 sm:px-6 py-2">Tag</th>
              )}
              <th className="px-4 sm:px-6 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentRows.map((c, idx) => (
              <tr key={c.id} className="align-middle">
                <td className="px-4 sm:px-6 py-2 text-xs text-gray-500">
                  {startIndex + idx + 1}
                </td>
                {visibleColumns.name && (
                  <td className="px-4 sm:px-6 py-2 text-gray-900">
                    {c.name}
                  </td>
                )}
                {visibleColumns.email && (
                  <td className="px-4 sm:px-6 py-2 text-gray-700">
                    {c.email}
                  </td>
                )}
                {visibleColumns.phone && (
                  <td className="px-4 sm:px-6 py-2 text-gray-700">
                    {c.phone}
                  </td>
                )}
                {visibleColumns.tag && (
                  <td className="px-4 sm:px-6 py-2">
                    {c.tag ? (
                      <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {c.tag}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                )}
                <td className="px-4 sm:px-6 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(c)}
                    className="mr-2 rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(c)}
                    className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {currentRows.length === 0 && (
              <tr>
                <td
                  colSpan={1 + allColumns.length}
                  className="px-4 sm:px-6 py-4 text-xs text-gray-500 text-center"
                >
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginationMeta && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-gray-200 text-xs text-gray-500">
          <span>
            Showing{" "}
            <span className="font-medium">
              {totalItems === 0 ? 0 : startIndex + 1}-
              {Math.min(startIndex + paginationMeta.totalPerPage, totalItems)}
            </span>{" "}
            of <span className="font-medium">{totalItems}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!paginationMeta.prevPage}
              onClick={() => paginationMeta.prevPage && onPageChange(paginationMeta.prevPage)}
              className={`rounded-full border px-3 py-1 ${
                !paginationMeta.prevPage
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Prev
            </button>
            <span>
              Page <span className="font-medium">{paginationMeta.currentPage}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </span>
            <button
              type="button"
              disabled={!paginationMeta.nextPage}
              onClick={() => paginationMeta.nextPage && onPageChange(paginationMeta.nextPage)}
              className={`rounded-full border px-3 py-1 ${
                !paginationMeta.nextPage
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default CustomersList;


