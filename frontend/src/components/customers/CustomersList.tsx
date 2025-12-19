import { useEffect, useMemo, useState } from "react";
import type { Customer } from "./types";

type ColumnId = "name" | "email" | "phone" | "tag";

const allColumns: { id: ColumnId; label: string; always?: boolean }[] = [
  { id: "name", label: "Name", always: true },
  { id: "email", label: "Email" },
  { id: "phone", label: "Number" },
  { id: "tag", label: "Tag" },
];

const STORAGE_KEY = "customersTableColumns";

type CustomersListProps = {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
};

const CustomersList = ({ customers, onEdit, onDelete }: CustomersListProps) => {
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [timezoneSearch, setTimezoneSearch] = useState("");
  const [filters, setFilters] = useState({
    hasPhone: false,
    timezones: [] as string[],
    companies: [] as string[],
    jobTitles: [] as string[],
  });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnId, boolean>>(
    () => {
      const base: Record<ColumnId, boolean> = {
        name: true,
        email: true,
        phone: true,
        tag: true,
        eventType: true,
        company: true,
        jobTitle: true,
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

  const eventTypes = useMemo(
    () => Array.from(new Set(customers.map((c) => c.eventType))).sort(),
    [customers],
  );

  const timezones = useMemo(
    () => Array.from(new Set(customers.map((c) => c.timezone))).sort(),
    [customers],
  );

  const companies = useMemo(
    () => Array.from(new Set(customers.map((c) => c.company))).sort(),
    [customers],
  );

  const jobTitles = useMemo(
    () => Array.from(new Set(customers.map((c) => c.jobTitle))).sort(),
    [customers],
  );

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return customers.filter((c) => {
      const matchesSearch =
        !term ||
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.company.toLowerCase().includes(term);
      const matchesEvent =
        eventFilter === "all" || c.eventType === eventFilter;
      const matchesPhone = !filters.hasPhone || c.phone.trim().length > 0;
      const matchesTimezone =
        filters.timezones.length === 0 ||
        filters.timezones.includes(c.timezone);
      const matchesCompany =
        filters.companies.length === 0 ||
        filters.companies.includes(c.company);
      const matchesJobTitle =
        filters.jobTitles.length === 0 ||
        filters.jobTitles.includes(c.jobTitle);
      return (
        matchesSearch &&
        matchesEvent &&
        matchesPhone &&
        matchesTimezone &&
        matchesCompany &&
        matchesJobTitle
      );
    });
  }, [customers, search, eventFilter, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const currentRows = filtered.slice(startIndex, startIndex + pageSize);

  type MultiFilterKey = "timezones" | "companies" | "jobTitles";

  const toggleMultiFilter = (key: MultiFilterKey, value: string) => {
    setFilters((prev) => {
      const list = prev[key];
      const exists = list.includes(value);
      return {
        ...prev,
        [key]: exists ? list.filter((v) => v !== value) : [...list, value],
      };
    });
  };

  const clearAllFilters = () => {
    setFilters({
      hasPhone: false,
      timezones: [],
      companies: [],
      jobTitles: [],
    });
    setTimezoneSearch("");
    setPage(1);
  };

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 px-4 sm:px-6 py-3 border-b border-gray-200 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Customers</h2>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <input
            type="search"
            placeholder="Search name, email, company..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-40 sm:w-56 rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={eventFilter}
            onChange={(e) => {
              setEventFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-gray-300 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All event types</option>
            {eventTypes.map((et) => (
              <option key={et} value={et}>
                {et}
              </option>
            ))}
          </select>
          <div className="relative">
            <button
              type="button"
              className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1"
              onClick={() => setFilterOpen((open) => !open)}
            >
              Filter
              <span className="text-[10px]">
                {filterOpen ? "▲" : "▼"}
              </span>
            </button>
            {filterOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-gray-200 bg-white shadow-xl z-20">
                <div className="max-h-80 overflow-y-auto px-4 pt-4 pb-3 space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Phone number
                    </p>
                    <label className="mt-2 flex items-center gap-2 text-xs text-gray-700">
                      <input
                        type="checkbox"
                        checked={filters.hasPhone}
                        onChange={() =>
                          setFilters((prev) => ({
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
                      Time zone
                    </p>
                    <div className="mt-2 mb-2">
                      <input
                        type="search"
                        placeholder="Search"
                        value={timezoneSearch}
                        onChange={(e) => setTimezoneSearch(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto text-xs text-gray-700">
                      {timezones
                        .filter((tz) =>
                          tz
                            .toLowerCase()
                            .includes(timezoneSearch.toLowerCase().trim()),
                        )
                        .map((tz) => (
                          <label
                            key={tz}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={filters.timezones.includes(tz)}
                              onChange={() => toggleMultiFilter("timezones", tz)}
                              className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            {tz}
                          </label>
                        ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Company
                    </p>
                    <div className="mt-2 space-y-1 max-h-24 overflow-y-auto text-xs text-gray-700">
                      {companies.map((company) => (
                        <label
                          key={company}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={filters.companies.includes(company)}
                            onChange={() =>
                              toggleMultiFilter("companies", company)
                            }
                            className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          {company}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Job title
                    </p>
                    <div className="mt-2 space-y-1 max-h-24 overflow-y-auto text-xs text-gray-700">
                      {jobTitles.map((title) => (
                        <label
                          key={title}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={filters.jobTitles.includes(title)}
                            onChange={() =>
                              toggleMultiFilter("jobTitles", title)
                            }
                            className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          {title}
                        </label>
                      ))}
                    </div>
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
                    onClick={() => setFilterOpen(false)}
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
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-xl z-20">
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
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-gray-200 text-xs text-gray-500">
        <span>
          Showing{" "}
          <span className="font-medium">
            {filtered.length === 0 ? 0 : startIndex + 1}-
            {Math.min(startIndex + pageSize, filtered.length)}
          </span>{" "}
          of <span className="font-medium">{filtered.length}</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`rounded-full border px-3 py-1 ${
              currentPage === 1
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Prev
          </button>
          <span>
            Page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className={`rounded-full border px-3 py-1 ${
              currentPage === totalPages
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default CustomersList;


