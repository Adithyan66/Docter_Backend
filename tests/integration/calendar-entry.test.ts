import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll } from 'vitest';

/**
 * Covers the two Mongo aggregation pipelines that were rewritten for D1
 * (monthly grouping and the by-date clinic/patient/treatment join), plus the
 * index-addressed appointment mutations the Schedule tab depends on.
 */

const DOCTOR = { id: crypto.randomUUID(), email: 'cal-doc@test.com', password: 'Passw0rd!' };
const OTHER_DOCTOR = { id: crypto.randomUUID(), email: 'other-doc@test.com' };
const CLINIC = { id: crypto.randomUUID(), name: 'Main Clinic' };
const OTHER_CLINIC = { id: crypto.randomUUID(), name: 'Second Clinic' };
const PATIENT = { id: crypto.randomUUID(), fullName: 'Alice Example', phone: '555-0100' };
const TREATMENT = { id: crypto.randomUUID(), name: 'Cleaning' };

let token = '';

const authed = (path: string, init: RequestInit = {}): Promise<Response> =>
  SELF.fetch(`https://example.com/api${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });

const jsonOf = (res: Response): Promise<any> => res.json();

async function pbkdf2Hash(password: string): Promise<string> {
  const iterations = 100_000;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    32 * 8
  );
  const b64 = (b: Uint8Array): string => {
    let s = '';
    for (const x of b) s += String.fromCharCode(x);
    return btoa(s);
  };
  return `pbkdf2$${iterations}$${b64(salt)}$${b64(new Uint8Array(bits))}`;
}

/** Tomorrow in UTC — entries must not be in the past. */
const tomorrow = (): string => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

const DATE = tomorrow();

beforeAll(async () => {
  const now = Date.now();
  const hash = await pbkdf2Hash(DOCTOR.password);

  await env.DB.prepare(
    'INSERT INTO doctors (id, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
  )
    .bind(DOCTOR.id, DOCTOR.email, hash, now, now)
    .run();

  await env.DB.prepare(
    'INSERT INTO doctors (id, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
  )
    .bind(OTHER_DOCTOR.id, OTHER_DOCTOR.email, hash, now, now)
    .run();

  for (const clinic of [CLINIC, OTHER_CLINIC]) {
    await env.DB.prepare(
      `INSERT INTO clinics (id, clinic_id, doctor_id, name, is_active, is_deleted, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, 0, ?, ?)`
    )
      .bind(clinic.id, clinic.name.toUpperCase().replace(/\s/g, ''), DOCTOR.id, clinic.name, now, now)
      .run();
  }

  await env.DB.prepare(
    `INSERT INTO patients (id, doctor_id, patient_id, first_name, full_name, phone, consultation_type,
                           visit_count, is_active, is_deleted, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'one-time', 0, 1, 0, ?, ?)`
  )
    .bind(PATIENT.id, DOCTOR.id, 'P0001', 'Alice', PATIENT.fullName, PATIENT.phone, now, now)
    .run();

  await env.DB.prepare(
    `INSERT INTO treatments (id, doctor_id, name, is_active, is_deleted, created_at, updated_at)
     VALUES (?, ?, ?, 1, 0, ?, ?)`
  )
    .bind(TREATMENT.id, DOCTOR.id, TREATMENT.name, now, now)
    .run();

  const login = await SELF.fetch('https://example.com/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: DOCTOR.email, password: DOCTOR.password, role: 'doctor' }),
  });
  token = (await jsonOf(login)).data.accessToken;
  expect(token).toBeTruthy();
});

/**
 * The workers pool isolates storage per test and rolls writes back afterwards, so
 * anything a test reads must be created inside that same test.
 */
const createEntry = async (overrides: Record<string, unknown> = {}): Promise<Response> =>
  authed('/calendar-entry', {
    method: 'POST',
    body: JSON.stringify({
      date: DATE,
      clinicId: CLINIC.id,
      startTime: '09:00',
      endTime: '17:00',
      notes: 'Morning session',
      appointments: [
        {
          patientId: PATIENT.id,
          treatmentId: TREATMENT.id,
          startTime: '10:00',
          endTime: '10:30',
        },
      ],
      ...overrides,
    }),
  });

/** Creates the standard entry and returns its id via the by-date view. */
const createEntryAndGetId = async (): Promise<string> => {
  expect((await createEntry()).status).toBe(201);
  const body = await jsonOf(await authed(`/calendar-entry/by-date?date=${DATE}`));
  const id = body.data.entries[0]?.id;
  expect(id).toBeTruthy();
  return id;
};

describe('calendar-entry', () => {
  it('creates an entry with an appointment', async () => {
    expect((await createEntry()).status).toBe(201);
  });

  it('rejects a second entry for the same clinic on the same date', async () => {
    expect((await createEntry()).status).toBe(201);

    const res = await createEntry({
      startTime: '18:00',
      endTime: '19:00',
      appointments: [],
    });
    expect(res.status).toBe(409);
  });

  it('rejects an overlapping session at a different clinic', async () => {
    expect((await createEntry()).status).toBe(201);

    const res = await createEntry({
      clinicId: OTHER_CLINIC.id,
      startTime: '16:00',
      endTime: '18:00',
      appointments: [],
    });
    expect(res.status).toBe(409);
  });

  it('allows a non-overlapping session at a different clinic', async () => {
    expect((await createEntry()).status).toBe(201);

    const res = await createEntry({
      clinicId: OTHER_CLINIC.id,
      startTime: '18:00',
      endTime: '20:00',
      appointments: [],
    });
    expect(res.status).toBe(201);
  });

  it('rejects an entry in the past', async () => {
    const res = await createEntry({ date: '2020-01-01', appointments: [] });
    expect(res.status).toBe(400);
  });

  it('rejects an appointment for an unknown patient', async () => {
    const res = await createEntry({ appointments: [{ patientId: crypto.randomUUID() }] });
    expect(res.status).toBe(404);
  });

  it('resolves clinic, patient and treatment in the by-date view', async () => {
    expect((await createEntry()).status).toBe(201);

    const res = await authed(`/calendar-entry/by-date?date=${DATE}`);
    expect(res.status).toBe(200);
    const body = await jsonOf(res);

    expect(body.data.date).toBe(DATE);
    expect(body.data.entries).toHaveLength(1);

    const entry = body.data.entries[0];
    expect(entry.clinic).toEqual({ id: CLINIC.id, name: CLINIC.name });
    expect(entry.startTime).toBe('09:00');
    expect(entry.appointments).toHaveLength(1);

    const apt = entry.appointments[0];
    expect(apt.patient.id).toBe(PATIENT.id);
    expect(apt.patient.fullName).toBe(PATIENT.fullName);
    // Mongo projected patients.phone as `mobile`; the port must keep that name.
    expect(apt.patient.mobile).toBe(PATIENT.phone);
    expect(apt.treatment).toEqual({ id: TREATMENT.id, name: TREATMENT.name });
    expect(apt.completed).toBe(false);
  });

  it('groups the month by date with distinct clinic names', async () => {
    expect((await createEntry()).status).toBe(201);

    const [year, month] = DATE.split('-');
    const res = await authed(`/calendar-entry/monthly?month=${Number(month)}&year=${year}`);
    expect(res.status).toBe(200);
    const body = await jsonOf(res);

    expect(body.data.year).toBe(Number(year));
    expect(body.data.month).toBe(Number(month));
    const day = body.data.days.find((d: any) => d.date === DATE);
    expect(day).toBeDefined();
    expect(day.clinics).toEqual([CLINIC.name]);
  });

  it('adds, toggles and deletes an appointment by index', async () => {
    const entryId = await createEntryAndGetId();

    const add = await authed(`/calendar-entry/${entryId}/appointments`, {
      method: 'POST',
      body: JSON.stringify({
        patientId: PATIENT.id,
        startTime: '11:00',
        endTime: '11:30',
      }),
    });
    expect(add.status).toBe(201);

    const toggle = await authed(`/calendar-entry/${entryId}/appointments/1/toggle-completed`, {
      method: 'PATCH',
    });
    expect(toggle.status).toBe(200);

    const afterToggle = await jsonOf(await authed(`/calendar-entry/${entryId}`));
    expect(afterToggle.data.appointments).toHaveLength(2);
    expect(afterToggle.data.appointments[1].completed).toBe(true);
    expect(afterToggle.data.appointments[0].completed).toBe(false);

    const del = await authed(`/calendar-entry/${entryId}/appointments/0`, { method: 'DELETE' });
    expect(del.status).toBe(200);

    const afterDelete = await jsonOf(await authed(`/calendar-entry/${entryId}`));
    expect(afterDelete.data.appointments).toHaveLength(1);
    // The surviving appointment is the one that had been toggled complete.
    expect(afterDelete.data.appointments[0].completed).toBe(true);
  });

  it('rejects an out-of-range appointment index', async () => {
    const entryId = await createEntryAndGetId();
    const res = await authed(`/calendar-entry/${entryId}/appointments/99`, { method: 'DELETE' });
    expect(res.status).toBe(404);
  });

  it('rejects an appointment outside clinic hours', async () => {
    const entryId = await createEntryAndGetId();
    const res = await authed(`/calendar-entry/${entryId}/appointments`, {
      method: 'POST',
      body: JSON.stringify({ patientId: PATIENT.id, startTime: '20:00', endTime: '21:00' }),
    });
    expect(res.status).toBe(400);
  });

  it('rejects an appointment overlapping an existing one', async () => {
    const entryId = await createEntryAndGetId();
    const res = await authed(`/calendar-entry/${entryId}/appointments`, {
      method: 'POST',
      body: JSON.stringify({ patientId: PATIENT.id, startTime: '10:15', endTime: '10:45' }),
    });
    expect(res.status).toBe(409);
  });

  it('deletes the entry', async () => {
    const entryId = await createEntryAndGetId();
    expect((await authed(`/calendar-entry/${entryId}`, { method: 'DELETE' })).status).toBe(200);
    expect((await authed(`/calendar-entry/${entryId}`)).status).toBe(404);
  });

  it('hides another doctor\'s entry', async () => {
    const entryId = await createEntryAndGetId();
    await env.DB.prepare('UPDATE calendar_entries SET doctor_id = ? WHERE id = ?')
      .bind(OTHER_DOCTOR.id, entryId)
      .run();

    expect((await authed(`/calendar-entry/${entryId}`)).status).toBe(404);
    const byDate = await jsonOf(await authed(`/calendar-entry/by-date?date=${DATE}`));
    expect(byDate.data.entries).toHaveLength(0);
  });
});

describe('analytics financial dashboard', () => {
  it('returns a zeroed dashboard when there is no revenue', async () => {
    const res = await authed('/analytics/financial/dashboard');
    expect(res.status).toBe(200);
    const body = await jsonOf(res);

    expect(body.data.metrics.totalRevenue).toBe(0);
    expect(body.data.metrics.averageRevenuePerVisit).toBe(0);
    expect(body.data.outstandingAmount).toBe(0);
    expect(body.data.paymentCompletionRate).toEqual({
      completedCount: 0,
      totalCount: 0,
      rate: 0,
    });
    expect(Array.isArray(body.data.revenueTrend)).toBe(true);
    expect(Array.isArray(body.data.revenueByClinic)).toBe(true);
  });

  it('aggregates revenue, methods, clinics and outstanding balance', async () => {
    const now = Date.now();
    const courseId = crypto.randomUUID();

    await env.DB.prepare(
      `INSERT INTO treatment_courses (id, doctor_id, patient_id, clinic_id, treatment_id, start_date,
                                      total_cost, total_paid, is_payment_completed, is_medically_completed,
                                      status, is_deleted, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 1000, 400, 0, 0, 'active', 0, ?, ?)`
    )
      .bind(courseId, DOCTOR.id, PATIENT.id, CLINIC.id, TREATMENT.id, now, now, now)
      .run();

    const visitId = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO visits (id, doctor_id, patient_id, course_id, clinic_id, visit_date, billed_amount,
                           is_deleted, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 400, 0, ?, ?)`
    )
      .bind(visitId, DOCTOR.id, PATIENT.id, courseId, CLINIC.id, now, now, now)
      .run();

    const payments: Array<[string, number, string, boolean]> = [
      [crypto.randomUUID(), 300, 'cash', false],
      [crypto.randomUUID(), 100, 'upi', false],
      // Refunded payments must be excluded from every revenue figure.
      [crypto.randomUUID(), 999, 'card', true],
    ];
    for (const [id, amount, method, refunded] of payments) {
      await env.DB.prepare(
        `INSERT INTO payments (id, doctor_id, patient_id, course_id, clinic_id, amount, method, paid_at,
                               refunded, is_deleted, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`
      )
        .bind(id, DOCTOR.id, PATIENT.id, courseId, CLINIC.id, amount, method, now, refunded ? 1 : 0, now, now)
        .run();
    }

    const body = await jsonOf(await authed('/analytics/financial/dashboard'));

    expect(body.data.metrics.totalRevenue).toBe(400);
    expect(body.data.metrics.revenueThisMonth).toBe(400);
    expect(body.data.metrics.revenueThisYear).toBe(400);
    // 400 revenue over a single visit / single active patient.
    expect(body.data.metrics.averageRevenuePerVisit).toBe(400);
    expect(body.data.metrics.averageRevenuePerPatient).toBe(400);

    // 1000 billed - 400 paid on an active course.
    expect(body.data.outstandingAmount).toBe(600);

    expect(body.data.paymentCompletionRate).toEqual({
      completedCount: 0,
      totalCount: 1,
      rate: 0,
    });

    const methods = body.data.revenueByPaymentMethod;
    expect(methods.map((m: any) => m.method)).toEqual(['cash', 'upi']);
    expect(methods[0].amount).toBe(300);
    expect(methods[0].percentage).toBe(75);
    expect(methods[1].percentage).toBe(25);

    expect(body.data.revenueByClinic).toEqual([
      { clinicId: CLINIC.id, clinicName: CLINIC.name, amount: 400 },
    ]);

    const month = new Date().toISOString().slice(0, 7);
    expect(body.data.monthlyRevenueComparison).toEqual([{ month, amount: 400 }]);
  });
});
