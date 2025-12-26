import { useMemo, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useQueryClient } from "@tanstack/react-query";
import BookingDetailsModal, { type Booking } from "./BookingDetailsModal";
import { useFilteredEvents } from "../../lib/queries";
import type { FilteredEvent } from "../../lib/api";

type TabId = "upcoming" | "past";

const BookingsList = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>("upcoming");
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  
  // Applied date range (used for API query)
  const [appliedFromDate, setAppliedFromDate] = useState<Date | null>(null);
  const [appliedToDate, setAppliedToDate] = useState<Date | null>(null);

  // Format dates for API (YYYY-MM-DD)
  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Determine filter and params based on APPLIED dates
  const fromDateStr = formatDateForAPI(appliedFromDate);
  const toDateStr = formatDateForAPI(appliedToDate);
  const filter = fromDateStr && toDateStr ? "range" : activeTab;
  const params = fromDateStr && toDateStr
    ? { from_date: fromDateStr, to_date: toDateStr, current_page: currentPage, size: pageSize }
    : { current_page: currentPage, size: pageSize };

  const {
    data: eventsData,
    isLoading: loading,
    error: queryError,
  } = useFilteredEvents(filter, params);
  
  const grouped = eventsData?.data || {};
  const paginationMeta = eventsData?.meta;

  const error = queryError instanceof Error ? queryError.message : null;

  // Map API event to Booking shape used in UI
  const mapEventToBooking = (dateLabel: string, ev: FilteredEvent): Booking => {
    const attendee =
      ev.contact_name || ev.contact_email || "Unknown attendee";

    // Convert "HH:MM" to 12-hour range string
    const to12Hour = (time: string): string => {
      const [h, m] = time.split(":").map(Number);
      const period = h >= 12 ? "PM" : "AM";
      const displayHours = h % 12 === 0 ? 12 : h % 12;
      return `${displayHours.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")} ${period}`;
    };

    const startLabel = to12Hour(ev.start_time);
    const endLabel = to12Hour(ev.end_time);

    return {
      id: ev.id,
      start: ev.start_at,
      dateLabel,
      timeRange: `${startLabel} – ${endLabel}`,
      attendee,
      eventType: ev.event_types || "Event",
      eventStatus: ev.event_status,
      isRescheduled: ev.is_rescheduled,
      hosts: 1,
      nonHosts: 0,
      email: ev.contact_email || null,
      meetingLink: ev.location_link || "",
    };
  };

  // Map grouped events to bookings
  const bookingsByDate = useMemo(() => {
    const entries: [string, Booking[]][] = Object.entries(grouped).map(
      ([dateKey, events]) => [
        dateKey,
        (events as FilteredEvent[]).map((ev: FilteredEvent) => mapEventToBooking(dateKey, ev)),
      ],
    );

    // Sort dates descending for upcoming, ascending for past
    entries.sort(([a], [b]) => {
      if (activeTab === "upcoming") {
        return a < b ? 1 : -1;
      }
      return a > b ? 1 : -1;
    });

    return entries;
  }, [grouped, activeTab]);

  // Reset to page 1 when filter changes
  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleApplyDateRange = () => {
    if (fromDate && toDate) {
      setAppliedFromDate(fromDate);
      setAppliedToDate(toDate);
      setCurrentPage(1);
    }
  };

  const totalEvents = useMemo(
    () => bookingsByDate.reduce((sum, [, list]) => sum + list.length, 0),
    [bookingsByDate],
  );

  return (
    <>
      {/* Top controls: count */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end mb-4">
        <p className="text-xs text-gray-500">
          Displaying {totalEvents} event{totalEvents === 1 ? "" : "s"}
        </p>
      </div>

      {/* Tabs + actions */}
      <div className="rounded-t-lg border border-gray-200 border-b-0 bg-white">
        <div className="flex items-center justify-between px-4 sm:px-6 pt-3">
          <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
            {(["upcoming", "past"] as TabId[]).map((tab) => {
              const active = tab === activeTab;
              const label = tab === "upcoming" ? "Upcoming" : "Past";
              return (    
                <button
                  key={tab}
                  type="button"
                  className={`relative pb-2 ${
                    active ? "text-blue-600" : "text-gray-500 hover:text-gray-800"
                  }`}
                  onClick={() => handleTabChange(tab)}
                >
                  {label}
                  {active && (
                    <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
            <button
              type="button"
              className="text-sm text-gray-500 -mt-2 hover:text-gray-800 flex items-center gap-1"
              onClick={() => {
                if (!dateRangeOpen && appliedFromDate && appliedToDate) {
                  // Pre-fill with applied dates when opening
                  setFromDate(appliedFromDate);
                  setToDate(appliedToDate);
                }
                setDateRangeOpen((v) => !v);
              }}
            >
              Date range
              <span className="text-[10px]">
                {dateRangeOpen ? "▲" : "▼"}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 pb-3">
            <button
              type="button"
              className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Export
            </button>
            <button
              type="button"
              className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1"
              onClick={() => setFilterOpen((v) => !v)}
            >
              Filter
              <span className="text-[10px]">{filterOpen ? "▲" : "▼"}</span>
            </button>
          </div>
        </div>

        {/* Date range panel */}
        {dateRangeOpen && (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-900">Date range</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* From Date */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 min-w-[50px]">
                      From
                    </label>
                    <DatePicker
                      value={fromDate}
                      onChange={(newValue: Date | null) => setFromDate(newValue)}
                      slotProps={{
                        textField: {
                          size: "small",
                          sx: {
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "8px",
                              fontSize: "0.875rem",
                              maxWidth: "200px",
                            },
                          },
                        },
                      }}
                    />
                  </div>

                  {/* To Date */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 min-w-[50px]">
                      To
                    </label>
                    <DatePicker
                      value={toDate}
                      onChange={(newValue: Date | null) => setToDate(newValue)}
                      minDate={fromDate || undefined}
                      slotProps={{
                        textField: {
                          size: "small",
                          sx: {
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "8px",
                              fontSize: "0.875rem",
                              maxWidth: "200px",
                            },
                          },
                        },
                      }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <button
                      type="button"
                      className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        setFromDate(null);
                        setToDate(null);
                        setAppliedFromDate(null);
                        setAppliedToDate(null);
                        setDateRangeOpen(false);
                      }}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-blue-600 bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 hover:border-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleApplyDateRange}
                      disabled={!fromDate || !toDate}
                    >
                      Apply
                    </button>
                  </div>
                </div>
                {(fromDate || toDate) && (
                  <div className="text-xs text-gray-500 pt-1">
                    {fromDate && toDate
                      ? `Ready to show events from ${fromDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })} to ${toDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })} - Click Apply to filter`
                      : fromDate
                      ? "Please select an end date"
                      : "Please select a start date"}
                  </div>
                )}
                {appliedFromDate && appliedToDate && (
                  <div className="text-xs text-blue-600 pt-1 font-medium">
                    Showing events from {appliedFromDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })} to {appliedToDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                )}
              </div>
            </div>
          </LocalizationProvider>
        )}
        {filterOpen && (
          <div className="px-4 sm:px-6 pb-3 text-xs text-gray-500">
            Additional filters coming soon.
          </div>
        )}
      </div>

      {/* Bookings list */}
      <div className="border border-t-0 border-gray-200 rounded-b-lg bg-white">
        {loading ? (
          <p className="px-4 sm:px-6 py-6 text-xs text-gray-500">
            Loading bookings...
          </p>
        ) : error ? (
          <p className="px-4 sm:px-6 py-6 text-xs text-red-500">{error}</p>
        ) : bookingsByDate.length === 0 ? (
          <p className="px-4 sm:px-6 py-6 text-xs text-gray-500">
            No meetings to show.
          </p>
        ) : (
          <>
            {bookingsByDate.map(([dateLabel, bookings]) => (
              <div key={dateLabel}>
                <div className="px-4 sm:px-6 py-3 border-b border-gray-100 text-xs font-medium text-gray-600">
                  {dateLabel}
                </div>
                {bookings.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className="w-full text-left px-4 sm:px-6 py-4 flex items-center justify-between gap-4 hover:bg-blue-50/40 focus:outline-none focus:bg-blue-50/60"
                    onClick={() => setSelectedBooking(b)}
                  >
                    <div className="flex items-center gap-4">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-500" />
                      <div>
                        <p className="text-xs text-gray-500">
                          {b.timeRange}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {b.attendee}
                        </p>
                        <p className="text-xs text-gray-500">
                          Event type{" "}
                          <span className="font-semibold text-gray-900">
                            {b.eventType}
                          </span>
                        </p>

                        {b.isRescheduled && (
                          <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 mt-1">
                            Rescheduled
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xs text-gray-500 whitespace-nowrap">
                        {b.hosts} host | {b.nonHosts} non-hosts
                      </p>
                      <button
                        type="button"
                        className="text-xs font-medium text-blue-600 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(b);
                        }}
                      >
                        Details
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            ))}

            {paginationMeta && paginationMeta.totalPage > 1 ? (
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-gray-100 text-xs text-gray-500">
                <span>
                  Showing{" "}
                  <span className="font-medium">
                    {paginationMeta.total === 0 ? 0 : (paginationMeta.currentPage - 1) * paginationMeta.totalPerPage + 1}-
                    {Math.min(paginationMeta.currentPage * paginationMeta.totalPerPage, paginationMeta.total)}
                  </span>{" "}
                  of <span className="font-medium">{paginationMeta.total}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!paginationMeta.prevPage}
                    onClick={() => paginationMeta.prevPage && setCurrentPage(paginationMeta.prevPage)}
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
                    <span className="font-medium">{paginationMeta.totalPage}</span>
                  </span>
                  <button
                    type="button"
                    disabled={!paginationMeta.nextPage}
                    onClick={() => paginationMeta.nextPage && setCurrentPage(paginationMeta.nextPage)}
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
            ) : (
              <p className="px-4 sm:px-6 py-4 text-xs text-gray-400 text-center border-t border-gray-100">
                You&apos;ve reached the end of the list
              </p>
            )}
          </>
        )}
      </div>

      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onSuccess={() => {
          // Invalidate all event filters to refresh the list
          queryClient.invalidateQueries({ queryKey: ["events"] });
        }}
      />
    </>
  );
};

export default BookingsList;


