# Rule number map — `R` ↔ `BR`

Two rule numberings exist for the same product. This file maps them.

| Set | Where | Status |
|---|---|---|
| `BR01`–`BR29` | [BRD](BRD%20-%20Perron%20Hasselt%20Room%20Management.md) §7, numbered to match the FigJam board | **Canonical. Cite these.** |
| `R0`–`R26` | `product-knowledge.md` §9 — in the designer's Obsidian vault, **not in this repo** | Discovery artifact. Do not cite in specs or to the client |

Built 2026-10-13 by reading both rule books in full. The two sets are **not** a renumbering of each other:
they were written independently, so some rules split, some merge, and two have no counterpart at all.

## R → BR

| `R` | Subject | `BR` | Relationship |
|---|---|---|---|
| R0 | No automation; admin enters every status and date | BR01 | 1:1 |
| R1 | *Available from* = day after the room's last booking ends | BR02 | 1:1 |
| R2 | Early move-out allowed; booking may close early; rent and *Available from* unchanged | BR16 | 1:1 · rent clause also BR10, anchor clause also BR03 |
| R2b | Between move-out and contract end the room is empty but not free; the two fields disagree on purpose | BR17 | 1:1 |
| R3 | Room status has 4 values; *Partially occupied* only for 2-person rooms | BR06 | 1:1 |
| R4 | Overstay keeps *Occupied*; admin updates from the actual move-out | BR18 | 1:1 |
| R5 | Check-out done → *Reserved* if a next booking exists, else *Available* | BR14 | 1:1 |
| R6 | Cancelling a booking means recalculating *Available from* by hand | BR15 | **partial** — the recalculation clause |
| R7 | Create → *Reserved*; sign → check-in → check-in done → *Occupied* | BR12 + BR13 | **1:2** |
| R8 | Minor repairs do not change room status; maintenance is a parallel list | BR25 | 1:1 |
| R9 | Renewal = new contract reusing the tenant record | BR11 | 1:1 |
| R10 | One staff member many bookings; check-in and check-out may differ | BR19 | 1:1 |
| R11 | A booking is never really deleted, it becomes *Cancelled* | BR15 | **partial** — the never-deleted clause |
| R12 | A room may hold several active contracts, up to capacity | BR07 | 1:1 · capacity itself is BR05 |
| R13 | One contract per tenant, no shared contract | BR08 | 1:1 |
| R14 | Deposit of a cancelled booking is handled outside the system | BR24 | 1:1 |
| R15 | Contracts and IDs are Drive links; inspection photos are uploaded | BR29 | 1:1 · the photo exception is BR20 |
| R16 | Deposit status has 3 values plus a returned date, not a checkbox | BR23 | 1:1 |
| R17 | Total = monthly rent × months; the total is not stored | BR10 | 1:1 |
| R18 | Three admin accounts with equal rights | BR27 | 1:1 |
| **R19** | **The moment both parties signed is not recorded** | **— none** | **PK only. See the gaps below** |
| R20 | No per-item deposit deduction, so no `Maintenance.Booking ID` | BR23 + BR26 | **1:2** |
| R21 | *Tenant confirmed* is a dropdown, at check-in and check-out | BR21 | 1:1 |
| R22 | Lite has no colour-tier alerts; one task list split by status | *not a BR* | BRD records it as **FR-G4** and in §4.2 Out of scope |
| R23 | No cancellation after signing | BR15 | **partial** — the before-signing clause |
| R24 | Money follows the **contract**, not the move-out date. No refund | BR10 | 1:1 · same target as R17 |
| R25 | *Available from* anchors to `Contract end`, never `Check-out date` | BR03 | 1:1 |
| R26 | Overlapping rooms are **marked**, never hidden; no new data field | BR04 | 1:1 |

### Rules that merge

| `BR` | Fed by |
|---|---|
| BR10 | R17 (how the total is computed) + R24 (that it follows the contract) |
| BR15 | R6 (recalculate by hand) + R11 (never deleted) + R23 (not after signing) |

## BR with no `R` in §9

Each was still covered somewhere in `product-knowledge.md`, just outside its rule book — except BR22.
Recorded here because that file is not in this repo, so this is the only place the comparison survives.

| `BR` | Subject | Where it lives in PK |
|---|---|---|
| BR05 | Capacity is 1 or 2 by room type and building | §3 Room, field `Max occupancy` |
| BR09 | 6 months / 1 year / *Others* with a free-text length | §3, field `Contract type` |
| BR20 | Inspection photos uploaded in two separate fields | inside R15 |
| **BR22** | **A deposit is optional; the amount is left empty** | **— nowhere** |
| BR28 | Tenants have no account and never access the system | §2 Actor table |

## Gaps worth closing

1. **R19 has no `BR`, and stays that way.** PK records a decision *not* to store a signing timestamp
   (client, 2026-10-04). Since nothing is carried over from PK, this is not being added to the BRD. Worth
   knowing if a developer ever asks why there is no signing date field: the BRD simply never asked for one.
2. **BR22 has no `R`.** Optional deposits appear in the BRD and the Functional Spec but nowhere in PK.
   Harmless — the canonical side is the one that has it.
3. **R22 is a design rule, not a business rule.** It sits in PK's rule book but belongs with FR-G4. Citing
   "R22" in a design discussion is fine; citing it to the client is not.

> [!NOTE]
> **Decided 2026-10-13: nothing is carried over from `product-knowledge.md`.** It is training material for the
> designer, it stays in the Obsidian vault and out of this repo, and it is not an input to the product docs or
> to decisions. This map exists so an `R` number found in an older note can still be translated.
>
> The one case where this was checked: PK §8 argues that the reopen condition for *Available until* (the empty
> gap between two contracts) has been met, because `Contract type` has an `Others` value for short
> arrangements. **No fact is lost by setting that aside** — `Others` and its free-text length are already
> canonical in **BR09**. What was PK-only is the inference drawn from it. BRD §4.2 therefore stands as written:
> *Available until* stays out of scope.
>
> Dates in PK that fall after 2026-10-13 (14/10, 15/10, 17/10, 18/10) are typos and are left as found,
> since the file is a record and is not edited.
