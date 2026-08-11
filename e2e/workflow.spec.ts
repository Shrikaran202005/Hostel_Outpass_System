import { test, expect } from '@playwright/test';

test.describe('Hostel Outing End-to-End Workflow Test', () => {
  const backendUrl = 'http://127.0.0.1:8000/api';

  test('Full Approval & Movement Workflow: Student -> HOD -> Warden (Parent Confirmed) -> Watchman Exit & Return', async ({ request, page }) => {
    // 1. Student Login
    const studentLoginResp = await request.post(`${backendUrl}/auth/login`, {
      data: {
        email: 'student.a@hostelapp.local',
        password: 'Hostel@123',
      },
    });
    expect(studentLoginResp.ok()).toBeTruthy();
    const studentData = await studentLoginResp.json();
    const studentToken = studentData.access_token;
    expect(studentData.role).toBe('STUDENT');

    // 2. Student creates outing request for 5 days in future
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const outingDateStr = futureDate.toISOString().split('T')[0];
    const outingCreateResp = await request.post(`${backendUrl}/outings`, {
      headers: { Authorization: `Bearer ${studentToken}` },
      data: {
        outing_date: outingDateStr,
        leaving_time: '11:00:00',
        expected_return_time: '23:59:00',
        destination: 'E2E Testing Center',
        reason: 'Automated Playwright Workflow Validation',
      },
    });
    expect(outingCreateResp.status()).toBe(201);
    const outing = await outingCreateResp.json();
    const outingId = outing.id;
    expect(outing.status).toBe('PENDING_HOD');

    // 3. HOD Login & Approve
    const hodLoginResp = await request.post(`${backendUrl}/auth/login`, {
      data: {
        email: 'hod.cse@hostelapp.local',
        password: 'Hostel@123',
      },
    });
    const hodToken = (await hodLoginResp.json()).access_token;

    const hodApproveResp = await request.post(`${backendUrl}/hod/outings/${outingId}/approve`, {
      headers: { Authorization: `Bearer ${hodToken}` },
      data: { comment: 'Approved by HOD in E2E' },
    });
    expect(hodApproveResp.ok()).toBeTruthy();
    expect((await hodApproveResp.json()).status).toBe('PENDING_WARDEN');

    // 4. Warden Login, Parent Confirmation & Approval
    const wardenLoginResp = await request.post(`${backendUrl}/auth/login`, {
      data: {
        email: 'warden.a@hostelapp.local',
        password: 'Hostel@123',
      },
    });
    const wardenToken = (await wardenLoginResp.json()).access_token;

    // Verify Warden CANNOT approve without parent confirmation
    const unconfirmedApprove = await request.post(`${backendUrl}/warden/outings/${outingId}/approve`, {
      headers: { Authorization: `Bearer ${wardenToken}` },
      data: { comment: 'Premature approval' },
    });
    expect(unconfirmedApprove.status()).toBe(400);

    // Warden confirms parent approval
    const parentConfirmResp = await request.post(`${backendUrl}/warden/outings/${outingId}/parent-confirmation`, {
      headers: { Authorization: `Bearer ${wardenToken}` },
      data: { parent_approval_confirmed: true },
    });
    expect(parentConfirmResp.ok()).toBeTruthy();
    expect((await parentConfirmResp.json()).parent_approval_confirmed).toBeTruthy();

    // Warden grants final approval
    const wardenApproveResp = await request.post(`${backendUrl}/warden/outings/${outingId}/approve`, {
      headers: { Authorization: `Bearer ${wardenToken}` },
      data: { comment: 'Parent verified and approved by Warden' },
    });
    expect(wardenApproveResp.ok()).toBeTruthy();
    expect((await wardenApproveResp.json()).status).toBe('APPROVED');

    // 5. Watchman Login, Verify Approval, Record Exit & Return
    const watchmanLoginResp = await request.post(`${backendUrl}/auth/login`, {
      data: {
        email: 'watchman@hostelapp.local',
        password: 'Hostel@123',
      },
    });
    const watchmanToken = (await watchmanLoginResp.json()).access_token;

    // Record Exit
    const exitResp = await request.post(`${backendUrl}/watchman/outings/${outingId}/exit`, {
      headers: { Authorization: `Bearer ${watchmanToken}` },
    });
    expect(exitResp.ok()).toBeTruthy();
    expect((await exitResp.json()).status).toBe('EXITED');

    // Record Return
    const returnResp = await request.post(`${backendUrl}/watchman/outings/${outingId}/return`, {
      headers: { Authorization: `Bearer ${watchmanToken}` },
    });
    expect(returnResp.ok()).toBeTruthy();
    const finalOuting = await returnResp.json();
    expect(['COMPLETED', 'LATE_RETURN']).toContain(finalOuting.status);

    // 6. Verify Complete Audit History
    const historyResp = await request.get(`${backendUrl}/outings/${outingId}/history`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    expect(historyResp.ok()).toBeTruthy();
    const history = await historyResp.json();
    const actions = history.map((h: any) => h.action);

    expect(actions).toContain('SUBMITTED');
    expect(actions).toContain('HOD_APPROVED');
    expect(actions).toContain('PARENT_APPROVAL_CONFIRMED');
    expect(actions).toContain('WARDEN_APPROVED');
    expect(actions).toContain('EXIT_RECORDED');
    expect(actions).toContain('RETURN_RECORDED');
  });
});
