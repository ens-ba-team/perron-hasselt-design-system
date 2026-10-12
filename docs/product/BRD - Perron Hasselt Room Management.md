# Business Requirements Document
## Perron Hasselt Room Management (Lite)

| | |
|---|---|
| **Client** | Perron Hasselt, contact: Mina |
| **Prepared by** | Enosta Product Design |
| **Version** | 0.2 (draft for client review) |
| **Date** | 2026-10-12 |
| **Status** | Draft. Awaiting client sign-off |
| **Source of truth** | FigJam board: https://www.figma.com/board/RnN40RUrCANewi4MBP60yU |

---

## 1. Purpose

This document describes what the Room Management back office must do for Perron Hasselt, and why. It records the business rules agreed with the client during discovery (24 Sep – 8 Oct 2026). It is meant for client sign-off before design and build continue.

The document describes **what** the system must do. Screen layouts are in the FigJam wireframes. Technical choices belong to the development team.

## 2. Business context

Perron Hasselt rents rooms and studios to students in Hasselt. Rooms, tenants and contracts are tracked today in spreadsheets. The team needs one place to record this information and to answer quickly which rooms can be offered.

The operators are not technical users. The client describes the product as **"an extended version of Excel"**. It should feel familiar, show everything openly and never change data on its own.

### 2.1 The one question the product answers

> **"Which rooms can be offered to a new tenant, starting from date X?"**

Everything else in the system (tenants, contracts, check-in and check-out, maintenance, deposits) supports this question.

## 3. Business objectives

| # | Objective | How we will know |
|---|---|---|
| O1 | Find offerable rooms for a given start date in under a minute | The Rooms list, sorted by *Available from*, answers the question without opening any other screen |
| O2 | Keep one record per tenant, contract, room and repair | No information is kept in a separate spreadsheet |
| O3 | Make sure every check-in, check-out and repair has a responsible person | Each staff member sees their open tasks in *My task* |
| O4 | Never lose track of a deposit | The deposit status of every contract can be read on the Bookings list |
| O5 | Keep the system easy to trust | No value changes unless an admin typed it |

## 4. Scope

### 4.1 In scope

- Room records for the **41 units** of today: Perron 19 (29 rooms) and Perron 17 (12 studios). The number is **not fixed**: admins can add rooms, and a new building, without a developer
- Tenant records, reused when a tenant renews
- Booking (contract) records: contract dates, rent, deposit, check-in and check-out
- Maintenance records, linked to a room
- Lists with filters, sorting and tabs; records are edited in a side panel
- Checking for date overlaps when creating a booking
- Inspection photos uploaded to the booking; links to contracts and ID documents stored on Google Drive

### 4.2 Out of scope (Lite version)

| Item | Reason | Revisit when |
|---|---|---|
| Reminders and notifications before a contract ends | The system does not act on its own. Automatic emails are exactly what the operators said they cannot control | Someone asks for it directly and accepts that the system will send something on its own |
| Colour-coded warnings by urgency | Every event would need an urgency level. Too much effort for 41 units and 3 people | Rooms get stuck in the wrong status because nobody noticed |
| "Available until" (empty gap between two contracts) | Deferred | Development confirms the overlap check (Q27) |
| Partial deposit refunds | Damage costs are settled outside the system | Perron wants to deduct damages item by item inside the system |
| Payment tracking | Out of scope from the original specification | Already listed as a future upgrade |
| Tenant accounts, online booking | Tenants never use the system | — |

## 5. Stakeholders and users

| Role | Who | What they do |
|---|---|---|
| **Admin** | 3 accounts with equal rights. No role-based permissions | Create and edit all records. The same people also do check-ins, check-outs and repairs |
| **Tenant** | Students renting a room | No system access. Everything the system knows about a tenant was entered by an admin |
| **Client / owner** | Mina | Approves this document |

## 6. Constraints and assumptions

| # | Constraint |
|---|---|
| C1 | Platform: **WordPress + ACF Pro + Admin Columns Pro**, with no custom code where possible |
| C2 | **No automation.** The system stores, filters and displays data. It never changes a value an admin entered (see BR01) |
| C3 | **Contracts and ID papers** stay on **Google Drive**; the system stores only the link, because uploaded files get public URLs (GDPR). **Inspection photos are pictures of the room** and are uploaded to the booking |
| C4 | WordPress revisions are switched on, so earlier values can be restored. Records are never deleted. A booking is set to *Cancelled* instead |

**Read-only computed columns are allowed.** A column may show a value calculated from other fields (for example, the contract total) as long as an admin never types into it and it never overwrites stored data.

## 7. Business rules

Rule numbers match the *Business Rules* section of the FigJam board.

### 7.1 System principle

| # | Rule |
|---|---|
| BR01 | **Manual entry.** The system never changes any value by itself. Admins enter every status and every date |

### 7.2 Rooms and availability

| # | Rule |
|---|---|
| BR02 | **Available from.** Each room has one *Available from* date: the first day after the **last booking** of the room ends (contract end date). If the room is *Partially occupied*, *Available from* is **today** |
| BR03 | **Anchor date.** *Available from* is always based on the **contract end date**, never on the actual move-out date. Between move-out and contract end, the previous tenant is still paying for the room. Letting it again would charge twice for the same room and period |
| BR04 | **Overlap check when creating a booking.** The admin enters the rental period. The system lists all rooms and **marks** those that already have a booking overlapping that period, placing them at the bottom. Rooms are never hidden, because special arrangements may still need them |
| BR05 | **Capacity.** Each room holds 1 or 2 people, depending on room type and building |
| BR06 | **Room status.** Four values: **Available · Reserved · Partially occupied · Occupied**. *Partially occupied* applies only to 2-person rooms with one tenant |
| BR07 | **Several contracts at once.** A room can have several active contracts at the same time, up to its capacity |

**Example: why BR02 says "last booking"**

| Room | Contracts | Available from |
|---|---|---|
| 1 person | A ends 28 Feb · B booked for 1 Mar – 31 Aug | **1 Sep** (B moves in on 1 Mar) |
| 2 persons, 1 tenant | A ends 28 Feb, second bed empty | **Today** |

**Room status at a glance**

| Situation | Room status | Available from |
|---|---|---|
| Nobody living there, nobody booked | Available | Today |
| Nobody living there, next tenant already booked | Reserved | Day after the last booking ends |
| 2-person room with one tenant | Partially occupied | Today |
| Room full | Occupied | Day after the last booking ends |

*Room status* describes what is happening in the room now. *Available from* describes money and contracts. They are allowed to differ. For example, a tenant who left early leaves the room empty, but it cannot be offered before the contract ends. The two columns sit side by side on the Rooms list so the difference is visible.

### 7.3 Contracts and tenants

| # | Rule |
|---|---|
| BR08 | **One contract per tenant.** Two people sharing a room have two independent contracts |
| BR09 | **Contract length.** Mainly 6 months or 1 year. Usual periods are September – February and February – August. Special arrangements use the type *Others*, with the length written in a text field |
| BR10 | **Rent.** Contract total = monthly rent × number of months **in the contract**, not up to the actual move-out. No refund for leaving early. The system stores only the monthly rent. The total is shown as a read-only value |
| BR11 | **Renewal.** A renewal creates a new booking that reuses the existing tenant record, so each tenant's history stays traceable. The old booking is checked out as normal and the new booking starts again with its own check-in, even in the same room |

### 7.4 Booking lifecycle

| # | Rule |
|---|---|
| BR12 | **New booking.** When a booking is created, the room becomes *Reserved* |
| BR13 | **Move-in.** Both parties sign, then check-in takes place. When check-in is done, the room becomes *Occupied*, or *Partially occupied* if it is a 2-person room with one tenant |
| BR14 | **Contract end.** The room becomes *Available* if nobody else lives there and no next booking exists, or *Reserved* if the next tenant is already booked. In a 2-person room where the other tenant stays, it becomes *Partially occupied* |
| BR15 | **Cancellation.** A cancelled booking is set to *Cancelled* and is never deleted. Cancellation is only possible **before signing**. After signing there is no cancellation. The admin must then **recalculate the room's Available from date by hand** |

**Booking status:** Upcoming → Active → Ended, or Upcoming → Cancelled.

| Step | What happens | Booking status | Room status |
|---|---|---|---|
| 1 | Admin creates a booking | Upcoming | Reserved |
| 2 | Both parties sign | Upcoming (no change) | Reserved (no change) |
| 3 | Tenant moves in, check-in done | Active | Occupied, or Partially occupied for a 2-person room with one tenant |
| 4 | Contract ends, tenant moves out | Ended | Available if no next booking · Reserved if the next tenant is booked · Partially occupied if the other tenant stays in a 2-person room |
| 5 | Tenant has not left after the end date | Active (no change) | Occupied (no change) |
| 6 | Booking cancelled (only before signing) | Cancelled | Back to the previous status. *Available from* must be updated |

> ⚠️ **Highest business risk:** if an admin cancels a booking and forgets to update *Available from*, the room looks unavailable when it is not. In the worst case the result is months of lost rent, and nothing on screen will show it.

### 7.5 Move-out and handover

| # | Rule |
|---|---|
| BR16 | **Early move-out.** A tenant may leave before the contract end or stay until the end. The booking may be closed early for operational purposes, but the rent does not change |
| BR17 | **Gap after early move-out.** Between move-out and contract end, the room is empty but still under the old contract and still paid for. It cannot be offered again. *Available from* stays on the contract end date |
| BR18 | **Overstay.** If a tenant has not left after the contract end, the room stays *Occupied*. The system does not change status by itself. The admin updates it according to the actual move-out |
| BR19 | **Handover staff.** Check-in and check-out may be handled by two different people. One person may handle many bookings |
| BR20 | **Inspection photos.** Photos are taken at both check-in and check-out and **uploaded to the booking** in two separate fields, so they can be compared when settling the deposit |
| BR21 | **Tenant confirmation.** After the inspection, the staff member records in a dropdown that the tenant agreed with the room condition. Used at both check-in and check-out |

### 7.6 Deposit

| # | Rule |
|---|---|
| BR22 | **Optional.** Not every contract has a deposit. The amount is left empty when it does not apply |
| BR23 | **Deposit status.** Three values: **None · Held · Returned**, plus the date returned. No partial refunds, because damages are settled outside the system |
| BR24 | **Deposit of a cancelled booking.** Handled directly outside the system. Not tracked |

### 7.7 Maintenance

| # | Rule |
|---|---|
| BR25 | **No effect on room status.** Minor repairs do not change the room status. Maintenance is a parallel task list |
| BR26 | **Linked to a room.** Each repair belongs to a room, not to a booking or a tenant |

### 7.8 Users and documents

| # | Rule |
|---|---|
| BR27 | **Accounts.** Three admin accounts with equal rights. No role-based permissions |
| BR28 | **Tenants.** Tenants have no account and never access the system |
| BR29 | **Documents.** Contracts and ID documents are stored on Google Drive; the system stores only the link. Inspection photos are the exception and are uploaded (BR20) |

## 8. Functional requirements

### 8.1 Rooms

| ID | Requirement |
|---|---|
| FR-R1 | Show all rooms in one list with columns: Room name, Building, Floor, Type, Max occupancy, Room status, Available from, Monthly rent, Open maintenance count |
| FR-R2 | **Default sort: Available from**, earliest first |
| FR-R3 | Filter by Building, Type and Room status |
| FR-R4 | Room status and Available from are placed side by side |
| FR-R5 | ~~Edit fields inline on the list~~ **Changed 2026-10-12:** edit in the record's side panel, opened from the list. Needs client confirmation |
| FR-R6 | Create a new room |

### 8.2 Bookings

| ID | Requirement |
|---|---|
| FR-B1 | List columns: Tenant, Room, Contract start, Contract end, Booking status, Check-in date & staff, Check-out date & staff, Monthly rent, Total (read-only) |
| FR-B2 | Tabs: **My task** (due this week and assigned to me) · **This week** (due this week, anyone's). Replaced *Check-ins this week*, *Check-outs this month* and *Deposits held* on 2026-10-12 |
| FR-B3 | Create a booking, either new or a renewal for an existing tenant |
| FR-B4 | When creating a booking, the admin selects a date range and sees all rooms, with overlapping ones marked and placed last (BR04) |
| FR-B5 | Booking fields: tenant, room, contract type, other contract length (only for *Others*), contract start, contract end, monthly rent, total (read-only), deposit amount, deposit status, deposit returned date (only when *Returned*), check-in date, check-in done, check-in staff, check-in photos, check-in tenant confirmed, check-out date, check-out done, check-out staff, check-out photos, check-out tenant confirmed, document link, notes |
| FR-B6 | Check-in and check-out dates are **entered by the admin**. They are not pre-filled from contract dates |
| FR-B7 | Check-in photos become available once check-in done is set to *Yes* |
| FR-B8 | Bookings are never deleted. Cancelled bookings keep status *Cancelled* |

**My task (Bookings)**: a read-only task column. It shows only the logged-in staff member's tasks:

| Stage | Value | Shown to | When |
|---|---|---|---|
| Check-in | Checkin Awaiting | Check-in staff | Check-in done = No |
| Check-in | Checkin Done | — | Admin sets check-in done = Yes. The booking leaves *My task* until the check-out stage |
| — | *(not shown)* | — | After check-in, until the week the check-out is due |
| Check-out | Checkout Awaiting | Check-out staff | During the week the **check-out date** falls in |
| Check-out | Checkout Done | — | Admin sets check-out done = Yes. The booking leaves *My task* |

The 7-day trigger uses the **check-out date**, not the contract end, because tenants may leave early (BR16).

### 8.3 Tenants

| ID | Requirement |
|---|---|
| FR-T1 | List columns: Tenant ID, Name, Phone, Email, University, Erasmus |
| FR-T2 | Show the tenant's booking history |
| FR-T3 | Create and edit tenants |

### 8.4 Maintenance

| ID | Requirement |
|---|---|
| FR-M1 | List columns: Room, Issue, Reported date, Assigned staff, Status, Actions |
| FR-M2 | Status values: **Open · In progress · Done**. Tabs per status, with counts |
| FR-M3 | **Actions** column, shown only when the assigned staff member is the logged-in user: Open → *Received* · In progress → *Fixing* · Done → no longer in My tasks |
| FR-M4 | Create and edit maintenance tickets |

### 8.5 General interface

| ID | Requirement |
|---|---|
| FR-G1 | Lists are the main screens. There is no separate dashboard |
| FR-G1b | Lists show an **ID column first** (stays visible while scrolling sideways) and an **Actions column last** (Edit, View). Rows are paginated: 10 / 20 / 50 per page, default 10 |
| FR-G2 | ~~Inline editing~~ **Changed 2026-10-12:** records are edited in a side panel over the list, not in a pop-up that hides it. Needs client confirmation |
| FR-G3 | Nothing is hidden behind tabs or accordions inside a record. Horizontal scrolling is preferred |
| FR-G4 | No colour coding by urgency. Status labels are neutral |
| FR-G5 | Nothing happens in the background: no scheduled jobs, automatic emails or automatic status changes |

## 9. Data model

```
Tenant  1 ── n  Booking  n ── 1  Room
Room    1 ── n  Maintenance
Staff   1 ── n  Booking (two roles: check-in staff, check-out staff)
Staff   1 ── n  Maintenance
```

| Entity | Fields |
|---|---|
| **Room** | Room ID, Room name, Building (Perron 19 / Perron 17, **extendable**), Floor, Type, Max occupancy (1 or 2), Monthly rent, Room status, Available from |
| **Tenant** | Tenant ID, Name, Phone, Email, University, Erasmus (yes/no) |
| **Booking** | Booking ID, Booking status (Upcoming / Active / Ended / Cancelled), Tenant ID, Room ID, Contract type (6 months / 12 months / Others), Other contract length, Contract start, Contract end, Monthly rent, Deposit, Deposit status (None / Held / Returned), Deposit returned date, Check-in date, Check-in done, Check-in staff, Check-in photos, Check-in tenant confirmed, Check-out date, Check-out done, Check-out staff, Check-out photos, Check-out tenant confirmed, Document, Notes |
| **Maintenance** | Maintenance ID, Room ID, Issue, Reported date, Staff ID, Status (Open / In progress / Done) |
| **Staff** | Staff ID, Name (the 3 WordPress admin accounts) |

**Three kinds of dates on a booking:** they must stay separate.

| Kind | Fields | Meaning |
|---|---|---|
| Legal | Contract start / end | Agreed in the contract. Drives rent and *Available from* |
| Planned | Check-in / Check-out date | Agreed handover appointment |
| Actual | Check-in / Check-out done | What really happened |

Keeping the three apart is what makes early move-out and overstay visible.

**Not stored:** the contract total. It is calculated from the monthly rent and shown read-only.

## 10. Risks

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| RK1 | Admin forgets to update *Available from* after a cancellation | Room looks unavailable, rent is lost | Rule BR15. Recalculation step listed in the cancellation procedure |
| RK2 | A multi-step action is left half done (for example status updated but date not), because nothing is automated | Lists show outdated status | Related fields placed side by side. Status counts on each list |
| RK3 | Overstaying tenant appears in an "offerable" filter | Room offered while still occupied | Room status shown next to *Available from* |
| RK4 | Some requirements may need custom code (Q27, Q28) | Cost or scope change | Development to confirm before build |
| RK5 | No log of who changed what (3 equal accounts) | Hard to trace mistakes | WordPress revisions switched on |

## 11. Open questions

| # | Question | Owner |
|---|---|---|
| Q27 | Can the overlap check when creating a booking (BR04) be built without custom code? If not, what is the cost? | Development |
| Q28 | Can the *My task* and *This week* columns on Bookings change with the date (due this week) in Admin Columns Pro, or do they need custom code? | Development |

## 12. Glossary

| Term | Meaning |
|---|---|
| **Available from** | First date a room (or a bed in a 2-person room) can be offered to a new tenant |
| **Booking** | One contract between Perron and one tenant for one room |
| **Partially occupied** | 2-person room with one tenant. Called *Còn chỗ* in internal documents |
| **Check-in / Check-out done** | The handover actually took place |
| **Early move-out** | Tenant leaves before contract end but still pays the full contract |
| **Overstay** | Tenant stays after contract end. The booking remains *Active* |
| **Others** | Contract type for special arrangements outside 6 or 12 months |

## 13. Sign-off

| Name | Role | Date | Signature |
|---|---|---|---|
| Mina | Client, Perron Hasselt | | |
| | Enosta Product Design | | |
