import { test } from "node:test";
import assert from "node:assert/strict";
import { IcsCalendarService, parseUpcomingEvents } from "../src/integrations/calendar/ics-calendar-service.js";
import { CalendarUnavailableError } from "../src/integrations/calendar/calendar-service.js";

const query = { from: new Date("2026-11-01T00:00:00Z"), to: new Date("2026-11-08T00:00:00Z"), limit: 10 };
const calendar = [
  "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//TLIS//Bot tests//EN",
  "BEGIN:VEVENT", "UID:show", "DTSTAMP:20261001T000000Z", "DTSTART:20261101T120000Z", "DTEND:20261101T130000Z",
  "RRULE:FREQ=DAILY;COUNT=4", "EXDATE:20261102T120000Z", "SUMMARY:Radio show", "END:VEVENT",
  "BEGIN:VEVENT", "UID:private", "DTSTAMP:20261001T000000Z", "DTSTART:20261103T100000Z", "DTEND:20261103T110000Z",
  "CLASS:PRIVATE", "SUMMARY:Private staff notes", "END:VEVENT",
  "BEGIN:VEVENT", "UID:cancelled", "DTSTAMP:20261001T000000Z", "DTSTART:20261103T110000Z", "DTEND:20261103T120000Z",
  "STATUS:CANCELLED", "SUMMARY:Cancelled", "END:VEVENT", "END:VCALENDAR", "",
].join("\r\n");
test("ICS recurrence expands, exceptions/private/cancelled events are excluded", async () => {
  const events = await parseUpcomingEvents(calendar, query);
  assert.equal(events.length, 3);
  assert.deepEqual(events.map(event => event.startsAt.toISOString()), [
    "2026-11-01T12:00:00.000Z", "2026-11-03T12:00:00.000Z", "2026-11-04T12:00:00.000Z",
  ]);
  assert.equal((await parseUpcomingEvents(calendar, { ...query, limit: 1 })).length, 1);
});
test("range is exclusive at end and malformed data is rejected", async () => {
  const events = await parseUpcomingEvents(calendar, { ...query, to: new Date("2026-11-03T12:00:00Z") });
  assert.equal(events.length, 1);
  await assert.rejects(parseUpcomingEvents("not a calendar", query), CalendarUnavailableError);
  await assert.rejects(parseUpcomingEvents(calendar, { ...query, limit: 100 }), /Invalid/);
});
test("ICS HTTP adapter uses bounded request and hides remote secrets on failure", async () => {
  const calls: RequestInit[] = [];
  const service = new IcsCalendarService("https://calendar.example/secret", async (_url, init) => {
    calls.push(init!);
    return new Response(calendar, { status: 200 });
  });
  assert.equal((await service.listUpcoming(query)).length, 3);
  assert.equal(calls[0]?.redirect, "error");
  assert.ok(calls[0]?.signal);
  const failure = new IcsCalendarService("https://calendar.example/secret", async () => { throw new Error("secret"); });
  await assert.rejects(failure.listUpcoming(query), error => {
    assert.ok(error instanceof CalendarUnavailableError);
    assert.doesNotMatch(error.message, /secret/);
    return true;
  });
});

test("recurrence overrides replace the original occurrence without duplicates", async () => {
  const override = [
    "BEGIN:VEVENT", "UID:show", "DTSTAMP:20261001T000000Z",
    "RECURRENCE-ID:20261103T120000Z", "DTSTART:20261103T140000Z", "DTEND:20261103T150000Z",
    "SUMMARY:Rescheduled show", "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const changed = calendar.replace("END:VCALENDAR", override);
  const events = await parseUpcomingEvents(changed, query);
  assert.equal(events.length, 3);
  assert.equal(events[1]?.startsAt.toISOString(), "2026-11-03T14:00:00.000Z");
  assert.equal(events[1]?.title, "Rescheduled show");
});

test("all-day dates and parameterized titles retain their calendar semantics", async () => {
  const source = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//TLIS//Bot tests//EN",
    "BEGIN:VEVENT", "UID:all-day", "DTSTAMP:20261001T000000Z",
    "DTSTART;VALUE=DATE:20261103", "DTEND;VALUE=DATE:20261104",
    "SUMMARY;LANGUAGE=sk:Deň rádia", "END:VEVENT", "END:VCALENDAR", "",
  ].join("\r\n");
  const events = await parseUpcomingEvents(source, query);
  assert.equal(events.length, 1);
  assert.equal(events[0]?.allDay, true);
  assert.equal(events[0]?.title, "Deň rádia");
  const event = events[0]!;
  assert.equal(new Intl.DateTimeFormat("en-GB", { timeZone: event.timeZone }).format(event.startsAt), "03/11/2026");
});
