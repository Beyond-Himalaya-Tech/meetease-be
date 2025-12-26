# MeetEase Frontend Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Entry Point & Initialization](#entry-point--initialization)
4. [Routing System](#routing-system)
5. [Authentication Flow](#authentication-flow)
6. [Layout System](#layout-system)
7. [API Integration](#api-integration)
8. [State Management (React Query)](#state-management-react-query)
9. [Page-by-Page Breakdown](#page-by-page-breakdown)
10. [Component Details](#component-details)
11. [API Call Flows](#api-call-flows)

---

## Project Overview

**MeetEase** is a meeting scheduling application built with:
- **Framework**: React 18 with TypeScript
- **Routing**: TanStack Router (file-based routing)
- **State Management**: TanStack Query (React Query) for server state
- **UI Library**: Material-UI (MUI) + Tailwind CSS
- **HTTP Client**: Native Fetch API with custom auth wrapper
- **Build Tool**: Vite

---

## Project Structure

```
src/
├── auth/                    # Authentication utilities
│   ├── requireAuth.ts      # Route guard for protected routes
│   └── storage.ts          # Token management and auth bootstrap
├── components/             # Reusable UI components
│   ├── availability/       # Availability management components
│   ├── bookings/          # Booking-related components
│   ├── customers/         # Contact/customer management
│   ├── dashboard/         # Dashboard components
│   ├── layout/            # Layout components (PageHeader, TopHeader)
│   ├── meeting/           # Meeting booking flow components
│   ├── scheduling/        # Event type management
│   ├── Sidebar.tsx        # Main navigation sidebar
│   └── toast/             # Toast notification components
├── layouts/                # Page layout wrappers
│   └── DefaultLayout.tsx   # Main app layout (Sidebar + TopHeader)
├── lib/                    # Core utilities and API
│   ├── api.ts             # All API functions and types
│   ├── queries.ts         # React Query hooks and query keys
│   └── userCache.ts       # User cache utilities
├── routes/                 # Route components (file-based routing)
│   ├── __root.tsx         # Root route component
│   ├── (auth)/            # Auth routes (login, forget-password)
│   ├── dashboard/         # Dashboard page
│   ├── scheduling/        # Scheduling page
│   ├── bookings/          # Bookings page
│   ├── customers/         # Contacts page
│   ├── availability/      # Availability page
│   ├── profile/           # Profile page
│   └── meetings/          # Public meeting booking pages
├── main.tsx               # Application entry point
└── router.tsx             # Router configuration
```

---

## Entry Point & Initialization

### `main.tsx` - Application Entry Point

**Location**: `src/main.tsx`

**Flow**:
1. **React Query Setup**
   ```typescript
   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 1000 * 60 * 5,  // 5 minutes
         gcTime: 1000 * 60 * 10,    // 10 minutes
         refetchOnWindowFocus: false,
         retry: 1,
       },
     },
   });
   ```

2. **MUI Theme Configuration**
   - Custom theme with blue-600 primary color
   - Gray-100 background
   - Custom typography settings

3. **Auth Bootstrap**
   ```typescript
   useEffect(() => {
     void bootstrapAuth();  // Attempts to refresh token on app load
   }, []);
   ```

4. **App Component Structure**:
   ```
   QueryClientProvider
   └── ThemeProvider
       └── CssBaseline
       └── RouterProvider (TanStack Router)
       └── Toaster (react-hot-toast)
   ```

**What happens on page load**:
- React Query client is initialized
- MUI theme is applied
- `bootstrapAuth()` is called to check for existing session
- Router is mounted and handles initial route

---

## Routing System

### Router Configuration

**File**: `src/router.tsx`

```typescript
export const router = createRouter({
  routeTree,  // Auto-generated from file structure
  defaultNotFoundComponent: NotFoundComponent,
});
```

### File-Based Routing

Routes are automatically generated from the `routes/` directory structure:

- `/` → `routes/(auth)/index.tsx` (Login page)
- `/dashboard` → `routes/dashboard/index.tsx`
- `/scheduling` → `routes/scheduling/index.tsx`
- `/bookings` → `routes/bookings/index.tsx`
- `/customers` → `routes/customers/index.tsx`
- `/availability` → `routes/availability/index.tsx`
- `/profile` → `routes/profile/index.tsx`
- `/meetings/:userSlug/:eventSlug` → `routes/meetings/$userSlug/$eventSlug.tsx`
- `/logout` → `routes/logout.tsx`

### Route Protection

**File**: `src/auth/requireAuth.ts`

```typescript
export async function requireAuth() {
  if (!isAuthenticated()) {
    await bootstrapAuth();  // Try to refresh token
  }
  
  if (!isAuthenticated()) {
    throw redirect({ to: "/" });  // Redirect to login
  }
}
```

**Usage in routes**:
```typescript
export const Route = createFileRoute("/dashboard/")({
  beforeLoad: requireAuth,  // Protected route
  component: DashboardRoute,
});
```

**Protected Routes**:
- `/dashboard`
- `/scheduling`
- `/bookings`
- `/customers`
- `/availability`
- `/profile`

**Public Routes**:
- `/` (Login)
- `/meetings/:userSlug/:eventSlug` (Public booking page)
- `/oauth/callback` (OAuth callback)

---

## Authentication Flow

### Token Management

**File**: `src/auth/storage.ts`

**Token Storage**:
- Tokens are stored in **memory** (not localStorage/cookies)
- `accessToken` variable holds the current token
- Token is retrieved via `getToken()`

**Bootstrap Auth Flow**:
```typescript
export async function bootstrapAuth() {
  // 1. Call /auth/refresh endpoint
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "GET",
    credentials: "include",  // Sends httpOnly cookie
  });
  
  // 2. Extract access_token from response
  const data = await res.json();
  if (data.access_token) {
    setToken(data.access_token);  // Store in memory
  }
}
```

**When bootstrapAuth is called**:
1. On app initialization (`main.tsx` useEffect)
2. Before protected route access (`requireAuth.ts`)
3. On 401 response (in `fetchWithAuth`)

### API Request Authentication

**File**: `src/lib/api.ts` - `fetchWithAuth()`

**Flow**:
```typescript
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // 1. Get token from memory
  let token = getToken();
  
  // 2. If no token, try to bootstrap (refresh)
  if (!token) {
    await bootstrapAuth();
    token = getToken();
  }
  
  // 3. Make request with Authorization header
  let response = await fetch(url, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });
  
  // 4. If 401, refresh token and retry
  if (response.status === 401) {
    await bootstrapAuth();
    const newToken = getToken();
    if (newToken && newToken !== token) {
      // Retry with new token
      response = await fetch(url, { /* ... */ });
    }
  }
  
  return response;
}
```

---

## Layout System

### DefaultLayout Component

**File**: `src/layouts/DefaultLayout.tsx`

**Structure**:
```
DefaultLayout
├── TopHeader (AppBar with user profile)
└── Flex Container
    ├── Sidebar (Navigation menu)
    └── Main Content Area
        └── {children} (Page content)
```

**Layout Flow**:
1. User navigates to a protected route
2. `requireAuth()` checks authentication
3. Route component renders
4. Route component wraps content in `<DefaultLayout>`
5. DefaultLayout renders:
   - `TopHeader` at the top
   - `Sidebar` on the left
   - Page content in the main area

**Responsive Behavior**:
- Sidebar is persistent on desktop, temporary on mobile
- Main content adjusts width based on sidebar state
- TopHeader shifts based on sidebar width

### Sidebar Component

**File**: `src/components/Sidebar.tsx`

**Navigation Items**:
- Dashboard → `/dashboard`
- Scheduling → `/scheduling`
- Bookings → `/bookings`
- Availability → `/availability`
- Contacts → `/customers`
- Logout → `/logout`

**Active State**:
- Uses `useRouterState()` to detect current pathname
- Highlights active route with blue background
- Updates on route changes

### TopHeader Component

**File**: `src/components/layout/TopHeader.tsx`

**Features**:
- User profile display (avatar + name/email)
- Profile dropdown menu
- Fetches user data via `useUser()` hook

**API Call**:
- `useUser()` → `getUser()` → `GET /api/v1/users`
- Called on every TopHeader render
- Cached for 10 minutes

---

## API Integration

### API Base Configuration

**File**: `src/lib/api.ts`

**Base URL**:
```typescript
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";
```

### API Functions Overview

#### 1. **User APIs**
- `getUser()` → `GET /users`
- `updateUser(userId, data)` → `PATCH /users/:id`

#### 2. **Contact APIs**
- `getContacts(notNull, eventType, currentPage, size)` → `GET /contacts?not_null=phone&event_type=1&current_page=1&size=10`
- `createContact(data)` → `POST /contacts`
- `updateContact(id, data)` → `PATCH /contacts/:id`
- `deleteContact(id)` → `DELETE /contacts/:id`

#### 3. **Event Type APIs**
- `getEventTypes(currentPage, size)` → `GET /event-types?current_page=1&size=10`
- `getEventTypeById(id)` → `GET /event-types/:id`
- `createEventType(data)` → `POST /event-types`
- `updateEventType(id, data)` → `PATCH /event-types/:id`

#### 4. **Availability APIs**
- `getAvailabilities()` → `GET /availabilities`
- `getAvailabilitiesByUserId(userId)` → `GET /availabilities/user/:userId`
- `getEventAvailabilities(eventTypeId, date)` → `GET /event-types/availabilities/:id/:date`
- `createAvailability(data)` → `POST /availabilities`
- `updateAvailability(id, data)` → `PATCH /availabilities/:id`
- `deleteAvailability(id)` → `DELETE /availabilities/:id`

#### 5. **Event/Booking APIs**
- `getFilteredEvents(filter, options)` → `GET /events/filter/:filter?from_date=...&to_date=...&current_page=1&size=10`
- `getEventById(id)` → `GET /events/:id`
- `createEvent(data)` → `POST /events`
- `rescheduleEvent(id, data)` → `PATCH /events/reschedule/:id`
- `cancelEvent(id)` → `PATCH /events/cancel/:id`

### Pagination Support

All list endpoints support pagination:
- `current_page`: Page number (default: 1)
- `size`: Items per page (default: 10)

**Response Structure**:
```typescript
{
  data: T[],  // Array of items
  meta: {
    total: number,           // Total items
    totalPage: number,       // Total pages
    currentPage: number,     // Current page
    totalPerPage: number,    // Items per page
    prevPage: number | null, // Previous page number
    nextPage: number | null  // Next page number
  }
}
```

---

## State Management (React Query)

### Query Client Configuration

**Location**: `src/main.tsx`

**Default Options**:
- `staleTime`: 5 minutes (data considered fresh)
- `gcTime`: 10 minutes (cache garbage collection)
- `refetchOnWindowFocus`: false
- `retry`: 1 attempt

### Query Keys Structure

**Location**: `src/lib/queries.ts`**

```typescript
export const queryKeys = {
  user: ["user"],
  contacts: (notNull, eventType, currentPage, size) => 
    ["contacts", { notNull, eventType, currentPage, size }],
  eventTypes: ["eventTypes"],
  eventType: (id) => ["eventType", id],
  availabilities: ["availabilities"],
  filteredEvents: (filter, params) => 
    ["events", "filter", filter, params],
};
```

### Query Hooks

#### `useUser()`
- **Query Key**: `["user"]`
- **API**: `GET /users`
- **Cache Time**: 10 minutes
- **Used In**: TopHeader, Profile page

#### `useContacts(notNull, eventType, currentPage, size)`
- **Query Key**: `["contacts", { notNull, eventType, currentPage, size }]`
- **API**: `GET /contacts?not_null=...&event_type=...&current_page=...&size=...`
- **Used In**: Contacts page

#### `useEventTypes(currentPage, size)`
- **Query Key**: `["eventTypes", currentPage, size]`
- **API**: `GET /event-types?current_page=...&size=...`
- **Used In**: Scheduling page, Contacts page (for filter dropdown)

#### `useFilteredEvents(filter, params)`
- **Query Key**: `["events", "filter", filter, params]`
- **API**: `GET /events/filter/:filter?from_date=...&to_date=...&current_page=...&size=...`
- **Used In**: Bookings page

### Mutation Hooks

All mutations follow this pattern:
1. Execute API call
2. On success: Invalidate related queries
3. Show success/error toast

**Example - `useCreateContact()`**:
```typescript
export function useCreateContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => createContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact created successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create contact");
    },
  });
}
```

---

## Page-by-Page Breakdown

### 1. Dashboard Page

**Route**: `/dashboard`
**File**: `src/routes/dashboard/index.tsx`

**Component Hierarchy**:
```
DashboardRoute
└── DefaultLayout
    ├── TopHeader
    │   └── useUser() → GET /users
    └── Sidebar
    └── PageContent
        ├── PageHeader (title: "Dashboard", subtitle: "...")
        └── DashboardOverview
```

**API Calls**:
- `useUser()` → Fetches user data (via TopHeader)

**Rendering Flow**:
1. Route loads → `requireAuth()` checks auth
2. `DashboardRoute` component renders
3. Wraps content in `<DefaultLayout>`
4. `PageHeader` displays title and subtitle
5. `DashboardOverview` renders dashboard content

---

### 2. Scheduling Page

**Route**: `/scheduling`
**File**: `src/routes/scheduling/index.tsx`

**Component Hierarchy**:
```
SchedulingRoute
└── DefaultLayout
    ├── TopHeader
    └── Sidebar
    └── PageContent
        ├── PageHeader (title: "Scheduling", subtitle: "Manage your event types...")
        └── EventTypesList
            ├── useEventTypes(currentPage, size) → GET /event-types?current_page=1&size=10
            └── Event Type Items
                └── Pagination Controls (if totalPage > 1)
```

**API Calls**:
- `useEventTypes(currentPage, size)` → `GET /event-types?current_page=1&size=10`
  - Returns: `{ data: EventType[], meta: PaginationMeta }`

**State Management**:
- `currentPage` state (default: 1)
- `pageSize` = 10
- Updates `currentPage` when user clicks Prev/Next

**User Interactions**:
1. Click "+ New event type" → Shows `NewEventTypeForm`
2. Click event type → Opens `EditEventTypeDialog`
3. Click copy icon → Copies booking link to clipboard
4. Click pagination → Updates `currentPage` → Refetches data

**Pagination Flow**:
```
User clicks "Next"
  → setCurrentPage(2)
  → useEventTypes(2, 10) triggers
  → GET /event-types?current_page=2&size=10
  → Updates UI with page 2 data
```

---

### 3. Bookings Page

**Route**: `/bookings`
**File**: `src/routes/bookings/index.tsx`

**Component Hierarchy**:
```
BookingsRoute
└── DefaultLayout
    ├── TopHeader
    └── Sidebar
    └── PageContent
        ├── PageHeader (title: "Bookings", subtitle: "See all upcoming...")
        └── BookingsList
            ├── useFilteredEvents(filter, params) → GET /events/filter/:filter?current_page=1&size=10
            ├── Tabs (Upcoming/Past/Date range)
            ├── Date Range Filter Panel
            ├── Export & Filter Buttons
            └── Events List (grouped by date)
                └── Pagination Controls (if totalPage > 1)
```

**API Calls**:
- `useFilteredEvents(filter, params)` → `GET /events/filter/:filter?current_page=1&size=10`
  - `filter`: "upcoming" | "past" | "range"
  - `params`: `{ from_date?, to_date?, current_page?, size? }`
  - Returns: `{ data: GroupedEventsResponse, meta: PaginationMeta }`

**State Management**:
- `activeTab`: "upcoming" | "past"
- `currentPage`: number (default: 1)
- `pageSize`: 10
- `appliedFromDate` / `appliedToDate`: Applied date range
- `fromDate` / `toDate`: Pending date range (in filter panel)

**Filter Flow**:
```
User selects date range
  → Sets fromDate/toDate (pending)
  → Clicks "Apply"
  → Sets appliedFromDate/appliedToDate
  → Sets currentPage = 1
  → useFilteredEvents("range", { from_date, to_date, current_page: 1, size: 10 })
  → GET /events/filter/range?from_date=...&to_date=...&current_page=1&size=10
```

**Tab Change Flow**:
```
User clicks "Past" tab
  → setActiveTab("past")
  → setCurrentPage(1)
  → useFilteredEvents("past", { current_page: 1, size: 10 })
  → GET /events/filter/past?current_page=1&size=10
```

**Event Actions**:
- Click "Details" → Opens `BookingDetailsModal`
- In modal: Click "Cancel" → `useCancelEvent()` → `PATCH /events/cancel/:id`
- In modal: Click "Reschedule" → Opens `RescheduleModal` → `useRescheduleEvent()` → `PATCH /events/reschedule/:id`

---

### 4. Contacts Page

**Route**: `/customers`
**File**: `src/routes/customers/index.tsx`

**Component Hierarchy**:
```
CustomersRoute
└── DefaultLayout
    ├── TopHeader
    └── Sidebar
    └── PageContent
        ├── PageHeader (title: "Contacts", subtitle: "Manage people...")
        │   └── "+ Add contact" Button
        └── Conditional Render:
            ├── Loading State
            ├── Error State
            ├── Empty State (if allCustomers.length === 0)
            └── CustomersList
                ├── useContacts(null, null, 1, 1) → Check if any contacts exist
                ├── useContacts(notNull, eventType, currentPage, size) → Get filtered contacts
                ├── useEventTypes() → Get event types for filter dropdown
                ├── Search Bar (frontend filter)
                ├── Event Type Dropdown
                ├── Filter Panel (Phone number, Event type)
                ├── Columns Dropdown
                ├── Customers Table
                └── Pagination Controls
```

**API Calls**:
1. **Empty State Check**:
   - `useContacts(null, null, 1, 1)` → `GET /contacts?current_page=1&size=1`
   - Purpose: Check if any contacts exist (for empty state)

2. **Main Data Fetch**:
   - `useContacts(notNull, eventType, currentPage, size)` → `GET /contacts?not_null=phone&event_type=1&current_page=1&size=10`
   - Returns: `{ data: Contact[], meta: PaginationMeta }`

3. **Event Types** (for filter):
   - `useEventTypes()` → `GET /event-types`
   - Used in: Event type filter dropdown

**State Management**:
- `appliedFilters`: `{ hasPhone: boolean, eventType: number | null }`
- `currentPage`: number (default: 1)
- `pageSize`: 10

**Filter Flow**:
```
User opens Filter panel
  → Pending filters sync with applied filters
  → User selects "Has phone number" checkbox
  → User selects event type from dropdown
  → User clicks "Apply"
  → onApplyFilters({ hasPhone: true, eventType: 1 })
  → setAppliedFilters({ hasPhone: true, eventType: 1 })
  → setCurrentPage(1)
  → useContacts("phone", 1, 1, 10) triggers
  → GET /contacts?not_null=phone&event_type=1&current_page=1&size=10
```

**Search Flow** (Frontend-only):
```
User types in search box
  → setSearch("query")
  → filtered = customers.filter(c => matches search)
  → Table displays filtered results
  → Pagination still shows backend totals
```

**CRUD Operations**:
- **Create**: `useCreateContact()` → `POST /contacts` → Invalidates all contacts queries
- **Update**: `useUpdateContact()` → `PATCH /contacts/:id` → Invalidates all contacts queries
- **Delete**: `useDeleteContact()` → `DELETE /contacts/:id` → Invalidates all contacts queries

---

### 5. Availability Page

**Route**: `/availability`
**File**: `src/routes/availability/index.tsx`

**Component Hierarchy**:
```
AvailabilityRoute
└── DefaultLayout
    ├── TopHeader
    └── Sidebar
    └── PageContent
        ├── PageHeader
        ├── AvailabilityHeader
        └── WeeklyHoursCard
            └── useAvailabilities() → GET /availabilities
```

**API Calls**:
- `useAvailabilities()` → `GET /availabilities`
- `useEventTypes()` → `GET /event-types` (for event type selection)

---

### 6. Profile Page

**Route**: `/profile`
**File**: `src/routes/profile/index.tsx`

**Component Hierarchy**:
```
ProfileRoute
└── DefaultLayout
    ├── TopHeader
    └── Sidebar
    └── PageContent
        ├── PageHeader (title: "Profile", subtitle: "Your account information")
        ├── Profile Header Section (Avatar + Name/Email)
        └── Personal Information Section
            └── useUser() → GET /users
            └── useUpdateUser() → PATCH /users/:id
```

**API Calls**:
- `useUser()` → `GET /users` (fetches current user)
- `useUpdateUser()` → `PATCH /users/:id` (updates user profile)

**Update Flow**:
```
User clicks "Edit"
  → Opens edit dialog
  → User modifies name/email
  → Clicks "Save Changes"
  → useUpdateUser({ userId, data })
  → PATCH /users/:userId
  → On success: Updates query cache + shows toast
```

---

### 7. Public Meeting Booking Page

**Route**: `/meetings/:userSlug/:eventSlug`
**File**: `src/routes/meetings/$userSlug/$eventSlug.tsx`

**Component Hierarchy**:
```
MeetingPageRoute
└── NewMeetingPage
    ├── EventInfo (Left column)
    ├── Calendar (Middle column)
    │   └── useEventType(eventTypeId) → GET /event-types/:id
    └── TimeSlots (Right column)
        └── getEventAvailabilities(eventTypeId, date) → GET /event-types/availabilities/:id/:date
    └── BookingForm (When date/time selected)
        └── useCreateEvent() → POST /events
```

**API Calls**:
1. **Event Type Info**:
   - `useEventType(eventTypeId)` → `GET /event-types/:id`
   - Fetches: title, duration, description

2. **Available Time Slots**:
   - `getEventAvailabilities(eventTypeId, date)` → `GET /event-types/availabilities/:id/:date`
   - Returns: Array of available time slots for selected date

3. **Create Booking**:
   - `useCreateEvent(data)` → `POST /events`
   - Data includes: event_type_id, start_at, end_at, timezone, name, email, phone, description

**Booking Flow**:
```
1. User visits /meetings/userSlug/eventSlug?id=6
2. Route extracts eventTypeId from query param
3. NewMeetingPage renders with 3 columns
4. User selects date on Calendar
5. TimeSlots fetches available slots for that date
6. User selects time slot
7. BookingForm appears
8. User fills name, email, notes
9. User clicks "Schedule Event"
10. useCreateEvent() → POST /events
11. On success: Navigate to confirmation page
```

---

## Component Details

### BookingsList Component

**File**: `src/components/bookings/BookingsList.tsx`

**Props**: None (self-contained)

**State**:
- `activeTab`: "upcoming" | "past"
- `currentPage`: number
- `dateRangeOpen`: boolean
- `filterOpen`: boolean
- `selectedBooking`: Booking | null
- `fromDate` / `toDate`: Date | null (pending)
- `appliedFromDate` / `appliedToDate`: Date | null (applied)

**API Integration**:
```typescript
const { data: eventsData } = useFilteredEvents(filter, {
  from_date: fromDateStr,
  to_date: toDateStr,
  current_page: currentPage,
  size: pageSize,
});

const grouped = eventsData?.data || {};  // GroupedEventsResponse
const paginationMeta = eventsData?.meta; // PaginationMeta
```

**Data Transformation**:
```typescript
// Backend returns: { "22nd Dec, 2025": [FilteredEvent, ...] }
// Component maps to: Booking[]
const bookingsByDate = Object.entries(grouped).map(([dateLabel, events]) => [
  dateLabel,
  events.map(ev => mapEventToBooking(dateLabel, ev))
]);
```

**Event Handlers**:
- `handleTabChange()` → Updates tab + resets to page 1
- `handleApplyDateRange()` → Applies date filter + resets to page 1
- Click booking → Opens `BookingDetailsModal`

---

### CustomersList Component

**File**: `src/components/customers/CustomersList.tsx`

**Props**:
```typescript
{
  customers: Customer[];              // From parent (paginated data)
  eventTypes: EventType[];            // For filter dropdown
  appliedFilters: AppliedFiltersType;  // Current backend filters
  onApplyFilters: (filters) => void;  // Callback to apply filters
  paginationMeta?: PaginationMeta;     // Pagination info from backend
  onPageChange: (page) => void;        // Callback to change page
  onEdit: (customer) => void;
  onDelete: (customer) => void;
}
```

**State**:
- `search`: string (frontend-only filter)
- `eventFilter`: string (pending, not yet applied)
- `pendingFilters`: AppliedFiltersType (what user is selecting)
- `filterOpen`: boolean
- `columnsOpen`: boolean

**Filter Logic**:
1. **Backend Filters** (applied on "Apply" click):
   - `hasPhone`: Filters contacts with phone numbers
   - `eventType`: Filters contacts by event type ID

2. **Frontend Filters** (applied immediately):
   - `search`: Filters by name, email, company (client-side)

**Pagination**:
- Uses `paginationMeta` from backend
- `onPageChange()` callback updates parent's `currentPage`
- Parent refetches with new page number

---

### EventTypesList Component

**File**: `src/components/scheduling/EventTypesList.tsx`

**State**:
- `currentPage`: number (default: 1)
- `pageSize`: 10
- `showForm`: boolean
- `editingEventType`: EventType | null
- `copiedEventId`: number | null

**API Integration**:
```typescript
const { data: eventTypesData } = useEventTypes(currentPage, pageSize);
const eventTypes = eventTypesData?.data || [];
const paginationMeta = eventTypesData?.meta;
```

**Actions**:
- Click "+ New event type" → Shows `NewEventTypeForm`
- Click event type → Opens `EditEventTypeDialog`
- Click copy icon → Copies booking link to clipboard

---

## API Call Flows

### Flow 1: User Logs In

```
1. User visits "/"
2. Login page renders
3. User enters credentials
4. POST /auth/login
5. Response contains access_token
6. setToken(access_token)
7. Navigate to /dashboard
```

### Flow 2: Loading Dashboard

```
1. User navigates to /dashboard
2. requireAuth() checks authentication
3. DashboardRoute component renders
4. Wraps in DefaultLayout
5. DefaultLayout renders:
   - TopHeader → useUser() → GET /users
   - Sidebar (no API calls)
6. PageHeader renders
7. DashboardOverview renders
```

### Flow 3: Viewing Contacts with Filters

```
1. User navigates to /customers
2. CustomersRoute renders
3. Two parallel queries:
   a. useContacts(null, null, 1, 1) → Check if contacts exist
   b. useContacts("phone", 1, 1, 10) → Get filtered contacts
4. CustomersList receives:
   - customers: Contact[]
   - paginationMeta: PaginationMeta
5. User types in search → Frontend filters
6. User opens Filter panel
7. User selects "Has phone number" + Event type
8. User clicks "Apply"
9. onApplyFilters({ hasPhone: true, eventType: 1 })
10. setAppliedFilters() + setCurrentPage(1)
11. useContacts("phone", 1, 1, 10) refetches
12. GET /contacts?not_null=phone&event_type=1&current_page=1&size=10
13. UI updates with filtered results
```

### Flow 4: Creating a Contact

```
1. User clicks "+ Add contact"
2. CustomerFormModal opens
3. User fills form and submits
4. useCreateContact().mutate(data)
5. POST /contacts
   Body: { user_id, name, email, phone, tag }
6. On success:
   - queryClient.invalidateQueries({ queryKey: ["contacts"] })
   - All contacts queries refetch
   - Toast: "Contact created successfully!"
   - Modal closes
```

### Flow 5: Viewing Bookings with Pagination

```
1. User navigates to /bookings
2. BookingsRoute renders
3. activeTab = "upcoming" (default)
4. useFilteredEvents("upcoming", { current_page: 1, size: 10 })
5. GET /events/filter/upcoming?current_page=1&size=10
6. Response: { data: GroupedEventsResponse, meta: PaginationMeta }
7. BookingsList maps grouped data to bookings
8. Renders events grouped by date
9. User clicks "Next"
10. setCurrentPage(2)
11. useFilteredEvents("upcoming", { current_page: 2, size: 10 })
12. GET /events/filter/upcoming?current_page=2&size=10
13. UI updates with page 2 data
```

### Flow 6: Rescheduling an Event

```
1. User clicks "Details" on a booking
2. BookingDetailsModal opens
3. User clicks "Reschedule"
4. RescheduleModal opens
5. Fetches event details: getEventById(booking.id)
   → GET /events/:id
6. Extracts event_type_id and timezone
7. User selects new date on Calendar
8. User selects new time from TimeSlots
   → getEventAvailabilities(eventTypeId, date)
   → GET /event-types/availabilities/:id/:date
9. User clicks "Reschedule"
10. useRescheduleEvent().mutate({ id, data })
11. PATCH /events/reschedule/:id
    Body: { start_at: "2025-12-25T10:00:00", timezone: "Asia/Kathmandu" }
12. On success:
    - queryClient.invalidateQueries({ queryKey: ["events"] })
    - All bookings queries refetch
    - Toast: "Event rescheduled successfully!"
    - Modal closes
```

### Flow 7: Public Meeting Booking

```
1. User visits /meetings/userSlug/eventSlug?id=6
2. MeetingPageRoute extracts eventTypeId from query
3. NewMeetingPage renders
4. useEventType(6) → GET /event-types/6
   → Fetches event details
5. Calendar renders available days
6. User selects date (e.g., Dec 24, 2025)
7. TimeSlots component:
   - Formats date as "2025-12-24"
   - getEventAvailabilities(6, "2025-12-24")
   - GET /event-types/availabilities/6/2025-12-24
   - Returns: ["09:00", "09:20", "10:00", ...]
   - Converts to 12-hour format: ["09:00 AM", "09:20 AM", ...]
8. User selects "09:00 AM"
9. BookingForm appears
10. User fills: name, email, notes
11. User clicks "Schedule Event"
12. useCreateEvent().mutate(data)
13. POST /events
    Body: {
      event_type_id: 6,
      start_at: "2025-12-24T09:00:00",
      end_at: "2025-12-24T09:20:00",
      timezone: "Asia/Kathmandu",
      name: "John Doe",
      email: "john@example.com",
      description: "Notes"
    }
14. On success: Navigate to /bookings/confirmation
```

---

## Key Integration Points

### 1. Authentication Token Flow

```
App Load
  → bootstrapAuth()
  → GET /auth/refresh (with httpOnly cookie)
  → Response: { access_token }
  → setToken(access_token) [in memory]

Every API Call
  → fetchWithAuth(url)
  → getToken() [from memory]
  → Request: Authorization: Bearer {token}

401 Response
  → bootstrapAuth() [refresh token]
  → Retry request with new token
```

### 2. React Query Cache Invalidation

**Pattern**:
```typescript
// After mutation
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["resource"] });
  // All queries starting with ["resource"] will refetch
}
```

**Examples**:
- Create contact → Invalidates `["contacts"]` → All contact queries refetch
- Update event type → Invalidates `["eventTypes"]` → All event type queries refetch
- Cancel event → Invalidates `["events"]` → All booking queries refetch

### 3. Pagination State Management

**Pattern**:
```typescript
const [currentPage, setCurrentPage] = useState(1);
const pageSize = 10;

const { data } = useQuery({
  queryKey: ["resource", currentPage, pageSize],
  queryFn: () => getResource(currentPage, pageSize),
});

// On filter change
const handleFilter = () => {
  setCurrentPage(1);  // Reset to first page
  // Filter applied, query refetches with page 1
};
```

### 4. Filter State Management (Contacts)

**Two-Level Filtering**:
1. **Pending Filters** (in CustomersList):
   - User selections before "Apply" clicked
   - Stored in `pendingFilters` state

2. **Applied Filters** (in CustomersRoute):
   - Actually sent to backend API
   - Stored in `appliedFilters` state
   - Updates trigger API refetch

**Flow**:
```
User opens Filter panel
  → pendingFilters syncs with appliedFilters
User changes filters
  → pendingFilters updates (no API call)
User clicks "Apply"
  → onApplyFilters(pendingFilters)
  → setAppliedFilters(pendingFilters)
  → API refetches with new filters
```

---

## Error Handling

### API Error Handling

**Pattern in `fetchWithAuth()`**:
```typescript
const response = await fetchWithAuth(url);

if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.message || "Failed to fetch");
}
```

### React Query Error Handling

**In Query Hooks**:
```typescript
const { data, error } = useQuery({
  queryFn: getResource,
  // Errors are caught by React Query
});

// In component
if (error) {
  return <ErrorDisplay message={error.message} />;
}
```

**In Mutation Hooks**:
```typescript
return useMutation({
  mutationFn: createResource,
  onError: (error: Error) => {
    toast.error(error.message || "Operation failed");
  },
});
```

---

## Performance Optimizations

1. **Query Caching**:
   - Data cached for 5 minutes (staleTime)
   - Cache garbage collected after 10 minutes (gcTime)

2. **Pagination**:
   - Only fetches current page data
   - Reduces payload size

3. **Conditional Queries**:
   ```typescript
   useQuery({
     queryKey: ["resource", id],
     queryFn: () => getResource(id),
     enabled: !!id,  // Only runs if id exists
   });
   ```

4. **Query Invalidation**:
   - Only invalidates related queries
   - Prevents unnecessary refetches

---

## Environment Configuration

**API Base URL**:
- Development: `http://localhost:8000/api/v1`
- Production: Set via `VITE_API_URL` environment variable

**Usage**:
```typescript
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";
```

---

## Summary

This frontend application follows a clean architecture:

1. **File-based routing** with TanStack Router
2. **Protected routes** via `requireAuth()` guard
3. **Server state** managed by React Query
4. **API calls** centralized in `lib/api.ts`
5. **Query hooks** centralized in `lib/queries.ts`
6. **Consistent layout** via DefaultLayout wrapper
7. **Pagination** integrated on all list pages
8. **Error handling** via React Query + toast notifications
9. **Type safety** with TypeScript throughout

All API integrations follow the same pattern:
- Query hooks for data fetching
- Mutation hooks for data modification
- Automatic cache invalidation
- Toast notifications for user feedback
- Pagination support where applicable

