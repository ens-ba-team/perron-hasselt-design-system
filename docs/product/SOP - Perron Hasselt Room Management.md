# Standard Operating Procedures
## Perron Hasselt Room Management (Lite)

| | |
|---|---|
| **For** | The 3 admin accounts (all handover and repair staff) |
| **Prepared by** | Enosta Product Design |
| **Version** | 0.1 (draft) |
| **Date** | 2026-10-08 |
| **Related** | BRD v0.1 · FigJam board https://www.figma.com/board/RnN40RUrCANewi4MBP60yU |

---

## Before you start: one rule

**The system never changes anything by itself.** It does not move a room to *Occupied* on the move-in date, and it does not end a booking when the contract ends. Every status and every date is what you typed.

So each real-world event below comes with a short checklist. **Do every line.** If you skip one, the lists will show something that is no longer true, and nothing on screen will warn you.

Each checklist says **which record** to open (Booking, Room, Tenant or Maintenance) and **which field** to change.

---

## Quick reference: working out *Available from*

You will need this card in several procedures. *Available from* is the first day the room, or one bed in a 2-person room, can be offered to a new tenant.

**Step 1.** Does the room have a free place **today**, with no booking for that place?
→ Yes: **Available from = today.**

**Step 2.** If not, look at the bookings of the room that are **not Cancelled and not Ended**.

- **1-person room:** take the booking with the **latest contract end**. *Available from* = the **day after** that date.
- **2-person room:** look at each bed separately. For each bed, take its latest contract end. *Available from* = the day after the **earlier** of the two.

**Always use the contract end date, never the move-out date.** A tenant who leaves early is still paying until the contract ends.

| Example | Available from |
|---|---|
| 1-person room. A ends 28 Feb. B booked 1 Mar – 31 Aug | **1 Sep** |
| 2-person room. Only A lives there, until 28 Feb. Other bed empty | **Today** |
| 2-person room. A until 28 Feb, C until 31 Aug | **1 Mar** |
| 1-person room. A left on 15 Jan, contract ends 28 Feb | **1 Mar** |

---

## Room status reference

| Situation | Room status |
|---|---|
| Nobody living there, nobody booked | Available |
| Nobody living there, next tenant booked | Reserved |
| 2-person room, one tenant living there | Partially occupied |
| Room full | Occupied |

---

## P1. Create a new booking

*When:* a tenant has agreed to rent a room. The contract may not be signed yet.

**1. Check the room is free**
- [ ] Bookings → **Create booking**. Enter the **contract start** and **contract end**.
- [ ] Look at the room list. Rooms with an overlapping booking are **marked and shown at the bottom**. Choose a room that is not marked, unless you have agreed a special arrangement.

**2. Tenant**
- [ ] Search for the tenant first. **Renewing or returning tenant → select the existing record. Do not create a duplicate.**
- [ ] New tenant → create the Tenant record: Name, Phone, Email, University, Erasmus.

**3. Booking record**
- [ ] Tenant, Room
- [ ] Contract type: 6 months / 12 months / Others. If *Others*, fill in **Other contract length**
- [ ] Contract start, Contract end
- [ ] Monthly rent. *The total is shown automatically. Do not type it anywhere.*
- [ ] Deposit amount (leave empty if none) and **Deposit status**: None or Held
- [ ] **Check-in date** (planned handover day) and **Check-in staff**
- [ ] **Check-out date** (planned) and **Check-out staff**, if already known
- [ ] Document: paste the Google Drive link
- [ ] Booking status: **Upcoming**

**4. Room record**
- [ ] **Room status:** change to **Reserved** only if the room is currently *Available*. If someone still lives there, leave it as it is.
- [ ] **Available from:** work it out again with the quick reference card. It usually moves later.

---

## P2. Contract signed

*When:* both parties sign.

- [ ] Nothing changes in the system. Booking stays **Upcoming**, room stays as it is.
- [ ] Optional: upload the signed contract to Google Drive and make sure the **Document** link is correct.

> After signing, a booking **cannot be cancelled** (see P7).

---

## P3. Check-in (tenant moves in)

*Who:* the **Check-in staff** of the booking. It appears in their **My task** as *Checkin Awaiting*.

**On the Booking**
- [ ] Do the inspection. Take photos and upload them to Google Drive.
- [ ] **Check-in done** → Yes
- [ ] **Check-in photos** → paste the Drive link
- [ ] **Check-in tenant confirmed** → Confirmed, once the tenant agrees with the room condition
- [ ] **Booking status** → **Active**

**On the Room**
- [ ] **Room status** → **Occupied**, or **Partially occupied** if it is a 2-person room and this is the only tenant
- [ ] **Available from** → check with the quick reference card. A 2-person room that just became full needs a new date.

---

## P4. Check-out at the end of the contract

*Who:* the **Check-out staff**. It appears in their **My task** as *Checkout Awaiting* from 7 days before the check-out date.

**On the Booking**
- [ ] Do the inspection. Take photos and upload them to Google Drive.
- [ ] **Check-out done** → Yes
- [ ] **Check-out photos** → paste the Drive link
- [ ] **Check-out tenant confirmed** → Confirmed
- [ ] **Booking status** → **Ended**

**On the Room**
- [ ] **Room status:**
  - **Reserved** if the next tenant is already booked
  - **Partially occupied** if it is a 2-person room and the other tenant stays
  - **Available** otherwise
- [ ] **Available from:** **no change.** It was already set from the contract end.

**Deposit:** see P8.

---

## P5. Early move-out

*When:* the tenant leaves **before** the contract end. They still pay the full contract. Nothing is refunded.

- [ ] Update **Check-out date** on the Booking to the new handover day, so the task appears in *My task* in time.
- [ ] On the day, follow **P4** completely, including setting the Booking to **Ended** and the Room status.

> ⚠️ **Do NOT change *Available from*.** The room is empty, but it is still paid for until the contract end. It cannot be offered before the day after the contract end.

> ⚠️ **Do NOT change Contract end.** The contract dates are the legal agreement and never change.

---

## P6. Tenant stays after the contract end (overstay)

- [ ] **Change nothing.** Booking stays **Active**, Room stays **Occupied**.
- [ ] If a new leaving day is agreed, update **Check-out date** on the Booking.
- [ ] When the tenant leaves, follow **P4**.

> ⚠️ The room may show *Available from* in the past while it is still occupied. Before offering a room, **always check Room status next to Available from.**

---

## P7. Cancel a booking

*Only possible **before the contract is signed**. After signing there is no cancellation.*

**On the Booking**
- [ ] **Booking status** → **Cancelled**
- [ ] **Never delete the booking.**
- [ ] Deposit of a cancelled booking is handled **outside the system**. Leave the deposit fields as they are.

**On the Room**
- [ ] **Room status:** set back to what it was before this booking. Usually **Available**, or *Occupied* / *Partially occupied* if someone still lives there.
- [ ] 🔴 **Available from: work it out again with the quick reference card.** It usually moves **earlier**.

> 🔴 **This is the step most often forgotten, and the most expensive one.** If you skip it, the room looks booked for months when it is actually free, and nothing on screen will tell you.

---

## P8. Return a deposit

- [ ] On the Booking: **Deposit status** → **Returned**
- [ ] **Deposit returned date** → the day you paid it back
- [ ] Damage costs are settled **outside the system**. There is no partial refund status.

---

## P9. Renewal (same tenant, new contract)

- [ ] Follow **P1** and **select the existing tenant**. Do not create a new tenant record.
- [ ] Contract start = the day after the current contract ends.
- [ ] **Available from:** work it out again. It moves to the day after the new contract end.
- [ ] **Old booking:** check out as normal at the end of the contract (**P4**), even if the tenant stays in the same room.
- [ ] **New booking:** once the new contract is signed, it starts again from the beginning. Check in as normal (**P3**).

> A renewal is always two separate bookings, each with its own check-in and check-out, even in the same room.

---

## P10. Maintenance

**Report a problem**
- [ ] Maintenance → **Create new issue ticket**: Room, Issue, Reported date, Assigned staff
- [ ] **Status** → **Open**. It appears in the assigned person's list as *Received*.

**Start the repair**
- [ ] **Status** → **In progress** (shown as *Fixing*)

**Finish the repair**
- [ ] **Status** → **Done**. It leaves the task list.

> A repair **never changes the Room status**. If a room really cannot be rented, write it in the room notes and discuss it with the team.

---

## P11. Weekly check (recommended every Monday, 10 minutes)

Because nothing happens automatically, a quick weekly look catches forgotten steps.

| Look at | If you see this | It means | Do |
|---|---|---|---|
| Bookings, tab **Active** | Contract end is in the past | A check-out was missed, or the tenant is overstaying | P4 or P6 |
| Bookings, tab **Upcoming** | Contract start is in the past | A check-in was not recorded, or a cancellation was not recorded | P3 or P7 |
| Bookings, tab **Check-outs this month** | Check-out date passed, Check-out done = No | Handover not done, or done but not recorded | P4 |
| Bookings, **Deposit status = Held** | Booking is Ended for more than 30 days | Someone's deposit is still being held | P8 |
| Rooms, sorted by **Available from** | Date in the past but status Occupied | Overstay, or a status not updated | Check the room's bookings |
| Rooms | Status *Available* but there is an Active booking | Room status not updated after check-in | P3 |
| Maintenance, tab **Open** | Ticket older than 2 weeks | Repair forgotten | Follow up with the assigned person |

---

## One-page summary

| Event | Booking status | Room status | Available from |
|---|---|---|---|
| New booking (P1) | Upcoming | Reserved, if the room was Available | **Recalculate** |
| Contract signed (P2) | — | — | — |
| Check-in (P3) | Active | Occupied / Partially occupied | Check (2-person rooms) |
| Check-out on time (P4) | Ended | Available / Reserved / Partially occupied | No change |
| Early move-out (P5) | Ended | Available / Reserved / Partially occupied | **No change** |
| Overstay (P6) | — | — | — |
| Cancel (P7) | Cancelled | Back to before | 🔴 **Recalculate** |
| Deposit returned (P8) | — | — | — |
| Renewal (P9) | New booking: Upcoming | — | **Recalculate** |
| Repair (P10) | — | **Never changes** | — |
