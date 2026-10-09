import { describe, expect, it } from "vitest";
import {
  CALENDAR_2026,
  addBusinessDays,
  addCalendarDays,
  businessDaysBetween,
  calendarDaysBetween,
  calendarFrom,
  dayList,
  daysLeft,
  isBusinessDay,
  skippedDays,
  weekday,
} from "./process.ts";

const noFriday = { ...CALENDAR_2026, fridayCounts: false };

describe("calendar days", () => {
  it("adds days across month and year ends", () => {
    // 14 Oct + 24: 17 days to 31 Oct, 7 more into November = 7 Nov (by hand).
    expect(addCalendarDays("2026-10-14", 24)).toBe("2026-11-07");
    expect(addCalendarDays("2026-10-14", 12)).toBe("2026-10-26");
    // 20 Oct + 90: 11 left in October, 30 in November, 31 in December = 72; 18 more = 18 Jan.
    expect(addCalendarDays("2026-10-20", 90)).toBe("2027-01-18");
    expect(addCalendarDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("counts the days between two dates, the first one as day 0", () => {
    expect(calendarDaysBetween("2026-10-14", "2026-10-14")).toBe(0);
    // 14 Oct → 5 Nov: 17 days to 31 Oct, plus 5 = 22.
    expect(calendarDaysBetween("2026-10-14", "2026-11-05")).toBe(22);
    // 1 Sep → 15 Nov: 30 (Sep) + 31 (Oct) + 14 = 75.
    expect(calendarDaysBetween("2026-09-01", "2026-11-15")).toBe(75);
    expect(calendarDaysBetween("2026-11-05", "2026-10-14")).toBe(-22);
  });

  it("refuses dates that do not exist", () => {
    expect(() => addCalendarDays("2026-02-30", 1)).toThrow();
    expect(() => addCalendarDays("14/10/2026", 1)).toThrow();
  });
});

describe("banking business days", () => {
  it("knows the weekdays (checked against a printed 2026 calendar)", () => {
    expect(weekday("2026-10-09")).toBe(5); // Friday
    expect(weekday("2026-10-11")).toBe(0); // Sunday
    expect(weekday("2026-09-17")).toBe(4); // Thursday
  });

  it("skips Saturday and the closed holidays; Friday by the switch", () => {
    expect(isBusinessDay("2026-10-10", CALENDAR_2026)).toBe(false); // Saturday
    expect(isBusinessDay("2026-10-09", CALENDAR_2026)).toBe(true); // Friday, short day
    expect(isBusinessDay("2026-10-09", noFriday)).toBe(false);
    expect(isBusinessDay("2026-09-21", CALENDAR_2026)).toBe(false); // Yom Kippur
    expect(isBusinessDay("2026-09-28", CALENDAR_2026)).toBe(true); // Sukkot's intermediate days are open
    expect(isBusinessDay("2026-10-27", CALENDAR_2026)).toBe(false); // Knesset election day (news reports)
  });

  it("counts business days after a request (the request day is day 0)", () => {
    // Sent Sunday 11 Oct: Mon 12, Tue 13, Wed 14, Thu 15, Fri 16 → 16 Oct.
    expect(addBusinessDays("2026-10-11", 5, CALENDAR_2026)).toBe("2026-10-16");
    // Without Friday: … Thu 15, Sun 18 → 18 Oct.
    expect(addBusinessDays("2026-10-11", 5, noFriday)).toBe("2026-10-18");
    // Sent Thursday 22 Oct: Fri 23, Sun 25, Mon 26, (Tue 27 is election day, closed), Wed 28, Thu 29.
    expect(addBusinessDays("2026-10-22", 5, CALENDAR_2026)).toBe("2026-10-29");
    // Without Friday: Sun 25, Mon 26, Wed 28, Thu 29, Sun 1 Nov.
    expect(addBusinessDays("2026-10-22", 5, noFriday)).toBe("2026-11-01");
    // Seven: … Thu 29, Fri 30, Sun 1 Nov.
    expect(addBusinessDays("2026-10-22", 7, CALENDAR_2026)).toBe("2026-11-01");
    // Without the closed days: Fri 23, Sun 25, Mon 26, Tue 27, Wed 28.
    expect(addBusinessDays("2026-10-22", 5, { fridayCounts: true, closed: [] })).toBe("2026-10-28");
  });

  it("skips Yom Kippur eve and Yom Kippur", () => {
    // Sent Thu 17 Sep: Fri 18 (1); Sun 20 and Mon 21 closed; Tue 22 (2), Wed 23 (3), Thu 24 (4), Fri 25 (5).
    expect(addBusinessDays("2026-09-17", 5, CALENDAR_2026)).toBe("2026-09-25");
    // Without Friday: Tue 22, Wed 23, Thu 24, Sun 27, Mon 28.
    expect(addBusinessDays("2026-09-17", 5, noFriday)).toBe("2026-09-28");
    // Without the holidays: Fri 18, Sun 20, Mon 21, Tue 22, Wed 23.
    expect(addBusinessDays("2026-09-17", 5, { fridayCounts: true, closed: [] })).toBe("2026-09-23");
    expect(skippedDays("2026-09-17", "2026-09-25", CALENDAR_2026)).toEqual(["2026-09-19", "2026-09-20", "2026-09-21"]);
  });

  it("counts business days between two dates", () => {
    expect(businessDaysBetween("2026-10-11", "2026-10-16", CALENDAR_2026)).toBe(5);
    expect(businessDaysBetween("2026-10-11", "2026-10-16", noFriday)).toBe(4);
    expect(businessDaysBetween("2026-09-17", "2026-09-25", CALENDAR_2026)).toBe(5);
    expect(() => businessDaysBetween("2026-10-16", "2026-10-11", CALENDAR_2026)).toThrow();
  });

  it("reads a calendar from fact inputs", () => {
    expect(calendarFrom("2026-09-20,2026-09-21", "no")).toEqual({ closed: ["2026-09-20", "2026-09-21"], fridayCounts: false });
    expect(calendarFrom("", "yes")).toEqual({ closed: [], fridayCounts: true });
  });
});

describe("a list of days for a picture", () => {
  it("marks each day after the start as a business day or not", () => {
    // After Sunday 11 Oct: Mon–Fri business, Sat 17 not, Sun 18 business.
    expect(dayList("2026-10-11", 7, CALENDAR_2026).map((d) => d.business)).toEqual([true, true, true, true, true, false, true]);
    expect(dayList("2026-10-11", 2, CALENDAR_2026)[1]).toEqual({ n: 2, date: "2026-10-13", business: true, count: 2 });
    // Saturday 17 Oct adds nothing to the count; Sunday 18 is the 6th business day.
    expect(dayList("2026-10-11", 7, CALENDAR_2026).map((d) => d.count)).toEqual([1, 2, 3, 4, 5, 5, 6]);
  });
});

describe("days left in a window", () => {
  it("subtracts the days used", () => {
    expect(daysLeft(24, 22)).toBe(2);
    expect(daysLeft(12, 15)).toBe(-3);
  });
});
