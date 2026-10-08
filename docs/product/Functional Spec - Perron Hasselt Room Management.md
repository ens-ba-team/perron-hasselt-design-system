# Functional Specification
## Perron Hasselt Room Management (Lite)

| | |
|---|---|
| **For** | Development team |
| **Prepared by** | Enosta Product Design |
| **Version** | 0.1 (draft) |
| **Date** | 2026-10-08 |
| **Related** | BRD v0.1 (business rules BR01–BR29) · SOP v0.1 (admin procedures P1–P11) · FigJam https://www.figma.com/board/RnN40RUrCANewi4MBP60yU |

---

## 0. How to read this document

- The BRD explains **why**. This document explains **what to configure**. Business rules are referenced as **BR##**, procedures as **P#**.
- Platform: **WordPress + ACF Pro + Admin Columns Pro**. The target is **no custom code**. Every item that probably needs code is marked **⚙️ Needs dev confirmation** and listed in section 9 with a fallback.
- Field names below are suggested ACF field names (`snake_case`). Labels are what admins see.

### Two rules that override everything

1. **No automation (BR01).** Nothing may change a stored value on its own: no cron, no `save_post` hooks that set other fields, no automatic emails, no status changes by date. **Read-only computed display columns are allowed** as long as they never write to the database.
2. **Money follows the contract (BR03, BR10).** *Available from* and the contract total are based on `contract_start` / `contract_end`, never on the check-out date.

---

## 1. Content types

| Post type | Slug | Records | Title |
|---|---|---|---|
| Room | `room` | 41 (fixed) | Room name, typed by admin, e.g. "P19 – 2.05" |
| Tenant | `tenant` | Grows over time | Full name, typed by admin |
| Booking | `booking` | Grows over time | ⚙️ See note |
| Maintenance | `maintenance` | Grows over time | Short issue description, typed by admin |
| Staff | — | 3 | **Use WordPress users**, no post type |

> **Booking title:** WordPress needs a post title. Without code the admin must type it. Suggested convention: `Room – Tenant – Start date`, e.g. "2.05 – Jan Peeters – 2027-02-01". An auto-generated title would need a small hook. It does not violate BR01 because it only sets the title on creation and never touches admin data, but it is still code. **Dev to decide.**

Relationships (FK always on the "many" side):

```
tenant  1 ── n  booking.tenant
room    1 ── n  booking.room
room    1 ── n  maintenance.room
user    1 ── n  booking.checkin_staff
user    1 ── n  booking.checkout_staff
user    1 ── n  maintenance.assigned_staff
```

No back-references are stored on Room or Tenant. Lists of bookings for a room or tenant are **displayed** from the relationship, never saved as a field.

---

## 2. Fields

### 2.1 Room

| Label | Field name | ACF type | Required | Choices / default | Notes |
|---|---|---|---|---|---|
| Building | `building` | Select | Yes | Perron 19 · Perron 17 | |
| Floor | `floor` | Number | Yes | | |
| Type | `room_type` | Select | Yes | *list to be supplied by client* | |
| Max occupancy | `max_occupancy` | Select | Yes | 1 · 2 | BR05 |
| Monthly rent | `monthly_rent` | Number (€) | Yes | | List price. The booking stores its own agreed rent |
| Room status | `room_status` | Select | Yes | Available · Reserved · Partially occupied · Occupied. Default: Available | **Entered by admin.** Never computed (BR01, BR06) |
| Available from | `available_from` | Date picker | Yes | Default: none | **Entered by admin** using the SOP reference card. Never computed (BR01, BR02) |
| Notes | `room_notes` | Textarea | No | | |

> "Partially occupied" is only valid when `max_occupancy` = 2. ACF cannot enforce this across fields without code. Leave it unvalidated. The weekly check (P11) covers it.

### 2.2 Tenant

| Label | Field name | ACF type | Required | Notes |
|---|---|---|---|---|
| Phone | `phone` | Text | No | |
| Email | `email` | Email | No | |
| University | `university` | Text | No | |
| Erasmus | `erasmus` | True / False | No | Default: No |

No photo or ID document fields (client confirmed). ID documents live on Google Drive (BR29).

### 2.3 Booking

Fields are grouped **visually only** (ACF *Group* or *Message* separators). **Do not use ACF Tabs or Accordions.** Nothing may be hidden behind a tab.

**Identity**

| Label | Field name | ACF type | Required | Choices / default | Notes |
|---|---|---|---|---|---|
| Booking status | `booking_status` | Select | Yes | Upcoming · Active · Ended · Cancelled. Default: Upcoming | Entered by admin |
| Tenant | `tenant` | Post Object → `tenant` | Yes | Single | Searchable |
| Room | `room` | Post Object → `room` | Yes | Single | See overlap check, section 5 |

**Contract**

| Label | Field name | ACF type | Required | Choices / default | Conditional |
|---|---|---|---|---|---|
| Contract type | `contract_type` | Select | Yes | 6 months · 12 months · Others | |
| Other contract length | `other_contract_length` | Text | Yes, when shown | | Show if `contract_type` = Others |
| Contract start | `contract_start` | Date picker | Yes | | |
| Contract end | `contract_end` | Date picker | Yes | | |
| Monthly rent | `monthly_rent` | Number (€) | Yes | | Agreed rent for this contract |
| Total | — | **Not a field** | — | — | Read-only display, see section 4.2 |

**Deposit**

| Label | Field name | ACF type | Required | Choices / default | Conditional |
|---|---|---|---|---|---|
| Deposit | `deposit_amount` | Number (€) | No | Empty = no deposit | |
| Deposit status | `deposit_status` | Select | Yes | None · Held · Returned. Default: None | BR23. **Select, not checkbox** |
| Deposit returned date | `deposit_returned_date` | Date picker | Yes, when shown | | Show if `deposit_status` = Returned |

**Check-in**

| Label | Field name | ACF type | Required | Choices / default | Conditional |
|---|---|---|---|---|---|
| Check-in date | `checkin_date` | Date picker | No | **No default. Do not pre-fill from contract start** | |
| Check-in done | `checkin_done` | Select | Yes | No · Yes. Default: No | |
| Check-in staff | `checkin_staff` | User | No | Single | |
| Check-in photos | `checkin_photos` | URL | No | Google Drive link | Show if `checkin_done` = Yes |
| Check-in tenant confirmed | `checkin_tenant_confirmed` | Select | No | Not confirmed · Confirmed. Default: Not confirmed | Show if `checkin_done` = Yes. **Select, not checkbox** (BR21) |

**Check-out**

| Label | Field name | ACF type | Required | Choices / default | Conditional |
|---|---|---|---|---|---|
| Check-out date | `checkout_date` | Date picker | No | **No default. Do not pre-fill from contract end** | |
| Check-out done | `checkout_done` | Select | Yes | No · Yes. Default: No | |
| Check-out staff | `checkout_staff` | User | No | Single | |
| Check-out photos | `checkout_photos` | URL | No | Google Drive link | Show if `checkout_done` = Yes |
| Check-out tenant confirmed | `checkout_tenant_confirmed` | Select | No | Not confirmed · Confirmed | Show if `checkout_done` = Yes |

**Other**

| Label | Field name | ACF type | Required |
|---|---|---|---|
| Document | `document_url` | URL | No |
| Notes | `notes` | Textarea | No |

> **Why three date layers stay separate:** `contract_*` is legal (money, *Available from*), `*_date` is the planned handover and `*_done` is what actually happened. Never derive one from another. The gap between them is how admins spot early move-out and overstay.

### 2.4 Maintenance

| Label | Field name | ACF type | Required | Choices / default |
|---|---|---|---|---|
| Room | `room` | Post Object → `room` | Yes | Single |
| Reported date | `reported_date` | Date picker | Yes | Default: today (this is a form default, not automation) |
| Assigned staff | `assigned_staff` | User | No | Single |
| Status | `maintenance_status` | Select | Yes | Open · In progress · Done. Default: Open |
| Notes | `notes` | Textarea | No | |

No link to Booking or Tenant (BR26).

---

## 3. List screens (Admin Columns Pro)

General settings for every list:

- **Inline editing on** for every stored field listed below (FR-G2)
- Horizontal scroll is acceptable. Do not drop columns to fit the screen
- No row colours or coloured badges by urgency (FR-G4). Status columns show plain text
- Tabs are implemented as **Admin Columns Pro saved segments / list screen views**, or as WordPress `views` links where noted

### 3.1 Rooms

| # | Column | Source | Inline edit | Sortable | Filter |
|---|---|---|---|---|---|
| 1 | Room name | Title | Yes | Yes | |
| 2 | Building | `building` | Yes | Yes | **Yes** |
| 3 | Floor | `floor` | Yes | Yes | |
| 4 | Type | `room_type` | Yes | Yes | **Yes** |
| 5 | Max occupancy | `max_occupancy` | Yes | Yes | |
| 6 | **Room status** | `room_status` | Yes | Yes | **Yes** |
| 7 | **Available from** | `available_from` | Yes | Yes, **default sort ascending** | |
| 8 | Monthly rent | `monthly_rent` | Yes | Yes | |
| 9 | Open maintenance | Count of `maintenance` where `room` = this and status ≠ Done | No | — | ⚙️ Q30 |

**Column order rule:** *Room status* (6) must sit **directly left of** *Available from* (7). They answer different questions and must be read together (BR03, overstay risk).

**Default view:** all rooms, sorted by `available_from` ascending. **Do not** default to a status filter. Filtering hides rows, sorting does not.

### 3.2 Bookings

| # | Column | Source | Inline edit | Sortable |
|---|---|---|---|---|
| 1 | Tenant | `tenant` | Yes | Yes |
| 2 | Room | `room` | Yes | Yes |
| 3 | Contract start | `contract_start` | Yes | Yes |
| 4 | **Contract end** | `contract_end` | Yes | Yes |
| 5 | **Check-out date** | `checkout_date` | Yes | Yes |
| 6 | Booking status | `booking_status` | Yes | Yes |
| 7 | Check-in date | `checkin_date` | Yes | Yes |
| 8 | Check-in staff | `checkin_staff` | Yes | Yes |
| 9 | Check-out staff | `checkout_staff` | Yes | Yes |
| 10 | Monthly rent | `monthly_rent` | Yes | Yes |
| 11 | Total | Computed, read-only | No | — ⚙️ Q29 |
| 12 | Deposit status | `deposit_status` | Yes | Yes |
| 13 | My task | Computed, read-only | No | — ⚙️ Q28 |

**Column order rule:** *Contract end* (4) sits **directly next to** *Check-out date* (5), so early move-out and overstay are visible.

**Tabs**

| Tab | Condition | Sort |
|---|---|---|
| **All** (default) | Not Cancelled | `contract_start` desc |
| Upcoming · Active · Ended · Cancelled | `booking_status` = value. **Show the count** next to each | |
| Check-ins this week | `checkin_date` within current week (Mon–Sun) | `checkin_date` asc |
| Check-outs this month | `checkout_date` within current month | `checkout_date` asc |
| **My task** | See section 4.3 | `checkin_date` / `checkout_date` asc |
| Deposits held | `deposit_status` = Held, **any booking status** | `contract_end` asc |

> "This week" and "this month" are **filters evaluated when the list loads**. They do not change data, so they comply with BR01.

### 3.3 Tenants

| # | Column | Inline edit |
|---|---|---|
| 1 | Name (title) | Yes |
| 2 | Phone | Yes |
| 3 | Email | Yes |
| 4 | University | Yes |
| 5 | Erasmus | Yes |
| 6 | Bookings | Read-only. Count or list of related bookings |

Tenant edit screen: show the tenant's **booking history** read-only, from the reverse relationship. Do not store it.

### 3.4 Maintenance

| # | Column | Source | Inline edit |
|---|---|---|---|
| 1 | Room | `room` | Yes |
| 2 | Issue | Title | Yes |
| 3 | Reported date | `reported_date` | Yes |
| 4 | Assigned staff | `assigned_staff` | Yes |
| 5 | Status | `maintenance_status` | Yes |
| 6 | Actions | Computed, read-only (section 4.4) | No |

**Tabs:** Open · In progress · Done, **with counts**. Default tab: Open.

---

## 4. Computed, read-only values

Every value here is **display only**. It must never be saved to a field, and admins cannot type into it.

### 4.1 Available from: NOT computed

Stored field, entered by the admin (SOP reference card). Listed here only so it is not built as a computed column by mistake.

### 4.2 Contract total

```
total = booking.monthly_rent × months(contract_start, contract_end)
```

- Months are whole months. Contracts have no partial months (BR10)
- For *Others* contracts, use the same calculation
- Shown on the Booking list (column 11) and on the Booking edit screen
- ⚙️ **Q29:** ACF and Admin Columns Pro do not calculate across fields out of the box. It probably needs a small custom column or display-only snippet.

### 4.3 My task (Bookings)

Shown only to the logged-in user. A booking is in **My task** if one of these rows applies:

| Value | Show to | Condition |
|---|---|---|
| **Checkin Awaiting** | `checkin_staff` = me | `checkin_done` = No **and** `booking_status` ≠ Cancelled |
| **Checkout Awaiting** | `checkout_staff` = me | `checkin_done` = Yes **and** `checkout_done` = No **and** today ≥ `checkout_date` − 7 days |
| *(not in My task)* | — | `checkout_done` = Yes, or `booking_status` = Cancelled |

Notes:
- **Two different people.** The check-in phase belongs to `checkin_staff`, the check-out phase to `checkout_staff` (BR19). The tab filter is *checkin_staff = me* **OR** *checkout_staff = me*, then the value decides whether the row shows for that person.
- **Anchor: `checkout_date`, not `contract_end`**, because tenants may leave early (BR16).
- If `checkout_date` is empty, the booking does not reach *Checkout Awaiting*. The weekly check (P11) catches contracts ending without a check-out date.
- **Checkin Done leaves My task immediately.** Once `checkin_done` = Yes, the booking is not shown again until 7 days before `checkout_date`.
- ⚙️ **Q28:** the condition compares with today's date. Probably needs a custom column or query filter.

### 4.4 Actions (Maintenance)

Shown only when `assigned_staff` = logged-in user.

| `maintenance_status` | Actions shows |
|---|---|
| Open | Received |
| In progress | Fixing |
| Done | *(row leaves My tasks)* |

This is a **label mapping of an existing field**, not a calculation. It should be possible with Admin Columns Pro's display settings, or by renaming the select labels.

---

## 5. Create booking: overlap check (BR04)

**Goal:** when the admin picks a room for a new booking, rooms that already have a booking overlapping the entered contract period are **marked and listed last, never hidden**.

**Overlap condition** for an existing booking *E* on the same room:

```
E.booking_status ∈ {Upcoming, Active}
AND E.contract_start ≤ new.contract_end
AND E.contract_end   ≥ new.contract_start
```

**Expected behaviour**

1. The admin enters `contract_start` and `contract_end` **before** choosing the room. Place the date fields above the Room field.
2. The Room selector lists **all 41 rooms**.
3. Rooms with ≥ 1 overlapping booking show a plain-text marker, e.g. *"Overlaps: Jan Peeters until 2027-01-31"*, and are sorted **to the bottom**.
4. **2-person rooms:** mark the room only when the number of overlapping bookings ≥ `max_occupancy`. A 2-person room with one overlapping booking still has a free place, so it shows as *"1 of 2 booked"* and is not pushed down.
5. The admin can still select a marked room. **No blocking, no validation error.**

⚙️ **Q27:** dynamic filtering of a Post Object field by date range is not standard ACF behaviour. It probably needs the `acf/fields/post_object/query` and `acf/fields/post_object/result` filters (PHP).

**Fallback without code:** a saved Bookings view *"By room, by contract dates"*. The admin checks the room's existing bookings in that view before saving. This is weaker, because it relies on the admin remembering to check.

---

## 6. Platform settings

| Setting | Value | Why |
|---|---|---|
| Users | 3 accounts, role **Administrator** or one shared custom role. No per-role permissions | BR27 |
| **Revisions** | On for `room`, `tenant`, `booking`, `maintenance` (ACF fields included) | Undo, and a basic trace of who changed what (RK5) |
| Delete / Trash | Bookings must not be deleted. Without code: train admins to use *Cancelled* (SOP P7). ⚙️ Optional: remove *Trash* capability for `booking` | BR15 |
| Comments, author box, featured image | Off for all four post types | Not used |
| Email notifications | **None.** Check that no plugin sends automatic emails | BR01 |
| Cron / scheduled actions | **None** related to these post types | BR01 |
| Admin language | **English** (primary). Dutch to follow later: keep all labels and choice values translatable, do not hard-code them | D5 |

---

## 7. Validation and messages

Keep validation **non-blocking** wherever possible (BR01: reminders, not barriers).

| Where | Check | Behaviour |
|---|---|---|
| Booking | `contract_end` < `contract_start` | Blocking. Standard ACF validation, clearly a typing error |
| Booking | `deposit_status` = Returned and no date | Blocking, via the conditional required field |
| Booking | `contract_type` = Others and no length | Blocking, via the conditional required field |
| Booking | Room overlaps (section 5) | **Marker only, never blocking** |
| Booking → Cancelled | Status changed to Cancelled | Confirmation dialog: *"Remember to update Available from on room [name]."* ⚙️ Needs a small JS snippet. Fallback: SOP P7 only |

---

## 8. Not to build (Lite)

Any of these violates BR01 or was deferred in the BRD:

- Automatic `room_status` or `available_from` updates, including on check-in, check-out or cancellation
- Automatic booking status changes on dates
- Reminders, notifications, scheduled emails
- Row colours, red/amber/green badges, urgency levels
- "Available until" or gap calculation
- Partial deposit refunds, payment tracking
- Tenant login, online booking
- Dashboard widgets. Lists are the main screens

---

## 9. Items needing dev confirmation

| # | Item | Probably needs | Fallback without code |
|---|---|---|---|
| **Q27** | Overlap marker in the Room selector (section 5) | ACF PHP filters | Admin checks a Bookings view by room before saving |
| **Q28** | *My task* value and tab with the 7-day date condition (4.3) | Custom column + query filter | Tab filters only on staff = me and done = No, without the 7-day rule |
| **Q29** | Contract total column (4.2) | Display-only custom column | Admin calculates by hand. Not recommended |
| **Q30** | Open maintenance count on Rooms (3.1) | Custom column, or ACP relational count if supported | Admin checks the Maintenance list filtered by room |
| — | Auto booking title (section 1) | `save_post` title hook | Admin types the title by convention |
| — | Cancel confirmation dialog (section 7) | Small admin JS | SOP P7 |
| — | Remove *Trash* for bookings (section 6) | Capability change | SOP P7 |

**Please return an estimate per item.** Anything above the agreed budget goes back to the client with its fallback.

---

## 10. Open design points

| # | Point | Status |
|---|---|---|
| D1 | ~~BR02 wording~~ Resolved 08/10: "last booking". A booking holds the room from creation, so *Available from* is updated in P1 | Closed |
| D2 | Renewal: closed 08/10. Old booking checks out as normal, new booking starts again with its own check-in (SOP P9) | Closed |
| D3 | Closed 08/10. *Checkin Done* leaves My task as soon as done = Yes | Closed |
| D4 | Room type list. Mock values are fine for wireframes and prototype. Real values are needed before build (select choices, Type filter) and come with the data migration | Before build |
| D5 | Closed 08/10. English first, Dutch later | Closed |
