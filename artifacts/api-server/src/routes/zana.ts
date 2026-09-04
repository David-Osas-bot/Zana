import { Router, type IRouter } from "express";
import { and, desc, eq, inArray, isNull, lte } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db, activityTable, projectMembersTable, projectsTable, tasksTable, taskRemindersTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import {
  CreateInviteBody,
  CreateInviteParams,
  CreateInviteResponse,
  CreateProjectBody,
  CreateProjectResponse,
  CreateTaskBody,
  CreateTaskParams,
  CreateTaskResponse,
  DeleteProjectParams,
  DeleteTaskParams,
  GetMeResponse,
  GetOverviewResponse,
  GetProjectParams,
  GetProjectResponse,
  ListProjectMembersParams,
  ListProjectMembersResponse,
  ListProjectsResponse,
  UpdateProjectBody,
  UpdateProjectParams,
  UpdateProjectResponse,
  UpdateTaskBody,
  UpdateTaskParams,
  UpdateTaskResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
router.use(requireAuth);

const CLIENT_ORIGIN = (process.env.CLIENT_ORIGIN ?? "http://localhost:5173").split(",")[0].trim();

// Sender address for outgoing mail (Brevo requires this to be a verified
// sender on your Brevo account). Read once from env, reused everywhere.
const FROM_EMAIL = process.env.BREVO_FROM ?? "";

// Sends transactional email via Brevo's HTTP API instead of SMTP.
// Render (and many free hosts) block or silently hang outbound SMTP ports,
// which made the old nodemailer/SMTP approach hang indefinitely. HTTPS
// (this call) uses port 443, which is never blocked.
async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.BREVO_API_KEY || !FROM_EMAIL) return;
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      sender: { email: FROM_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Brevo API error ${res.status}: ${body}`);
  }
}

const now = () => new Date();
const iso = (value: Date | string) => (value instanceof Date ? value.toISOString() : value);

async function getUser(userId: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  return user ?? null;
}

async function getMembership(projectId: string, userId: string) {
  const [member] = await db
    .select()
    .from(projectMembersTable)
    .where(and(eq(projectMembersTable.projectId, projectId), eq(projectMembersTable.userId, userId)));
  return member ?? null;
}

async function myProjectIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ projectId: projectMembersTable.projectId })
    .from(projectMembersTable)
    .where(eq(projectMembersTable.userId, userId));
  return rows.map((r) => r.projectId);
}

async function projectView(project: typeof projectsTable.$inferSelect) {
  const tasks = await db.select().from(tasksTable).where(eq(tasksTable.projectId, project.id));
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    color: project.color,
    taskCount: tasks.length,
    updatedAt: iso(project.updatedAt),
  };
}

async function taskView(task: typeof tasksTable.$inferSelect) {
  const [member] = task.assigneeId
    ? await db.select().from(projectMembersTable).where(and(eq(projectMembersTable.projectId, task.projectId), eq(projectMembersTable.userId, task.assigneeId)))
    : [];
  const reminders = await db.select().from(taskRemindersTable).where(eq(taskRemindersTable.taskId, task.id));
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status as "not_done" | "doing" | "done",
    assigneeId: task.assigneeId,
    assigneeName: member?.name ?? null,
    assigneeInitials: member?.initials ?? null,
    dueDate: task.dueDate ? iso(task.dueDate) : null,
    reminderOffsets: reminders.map((r) => r.offsetMinutes),
    createdAt: iso(task.createdAt),
    updatedAt: iso(task.updatedAt),
  };
}

// Rebuilds reminder rows for a task whenever its due date or offsets
// change. Deletes old ones first so edits/removals stay in sync.
async function syncTaskReminders(taskId: string, dueDate: Date | null, offsets: number[]) {
  await db.delete(taskRemindersTable).where(eq(taskRemindersTable.taskId, taskId));
  if (!dueDate || offsets.length === 0) return;
  const rows = offsets
    .filter((minutes) => Number.isFinite(minutes) && minutes > 0)
    .map((minutes) => ({
      id: randomUUID(),
      taskId,
      offsetMinutes: minutes,
      triggerAt: new Date(dueDate.getTime() - minutes * 60_000),
    }));
  if (rows.length) await db.insert(taskRemindersTable).values(rows);
}

// Builds the reminder email — reuses the same visual language as invites.
function buildReminderEmail(opts: {
  recipientName: string;
  taskTitle: string;
  projectName: string;
  dueDate: Date;
  minutesBefore: number;
  taskUrl: string;
}) {
  const { recipientName, taskTitle, projectName, dueDate, minutesBefore, taskUrl } = opts;

  const whenLabel =
    minutesBefore >= 1440 ? `${Math.round(minutesBefore / 1440)} day${minutesBefore >= 2880 ? "s" : ""}`
      : minutesBefore >= 60 ? `${Math.round(minutesBefore / 60)} hour${minutesBefore >= 120 ? "s" : ""}`
        : `${minutesBefore} minute${minutesBefore === 1 ? "" : "s"}`;

  const dueLabel = dueDate.toLocaleString(undefined, {
    weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });

  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #111111;">
    <div style="margin-bottom: 28px;">
      <span style="display: inline-block; width: 32px; height: 32px; line-height: 32px; text-align: center; background: #111111; color: #ffffff; font-weight: 700; font-size: 13px; border-radius: 8px; font-family: monospace;">za</span>
      <span style="font-weight: 800; font-size: 16px; margin-left: 8px; letter-spacing: -0.02em;">zana</span>
    </div>

    <h1 style="font-size: 20px; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 12px;">Due in ${whenLabel}</h1>

    <p style="font-size: 14px; line-height: 1.6; color: #333333; margin: 0 0 6px;">
      Hi ${recipientName}, a reminder that <strong>${taskTitle}</strong> on <strong>${projectName}</strong> is due:
    </p>
    <p style="font-size: 14px; font-weight: 700; margin: 0 0 24px;">${dueLabel}</p>

    <a href="${taskUrl}" style="display: inline-block; background: #111111; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 22px; border-radius: 8px; margin-bottom: 28px;">
      Open task &rarr;
    </a>

    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 0 0 20px;" />

    <p style="font-size: 11px; line-height: 1.6; color: #999999; margin: 0;">
      You're receiving this because you're the assignee (or creator) of this task on Zana.
    </p>
  </div>
  `;
}

// Checks for due reminders and fires them — email + marks for in-app pickup.
// Runs on an interval from server startup (see bottom of this file).
async function processDueReminders() {
  const dueReminders = await db
    .select()
    .from(taskRemindersTable)
    .where(and(lte(taskRemindersTable.triggerAt, now()), isNull(taskRemindersTable.firedAt)));

  for (const reminder of dueReminders) {
    try {
      const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, reminder.taskId));
      if (!task || !task.dueDate) {
        await db.update(taskRemindersTable).set({ firedAt: now() }).where(eq(taskRemindersTable.id, reminder.id));
        continue;
      }

      // Recipient: assignee if set, otherwise whoever created the task.
      const recipientId = task.assigneeId ?? task.createdBy;
      if (!recipientId) {
        await db.update(taskRemindersTable).set({ firedAt: now() }).where(eq(taskRemindersTable.id, reminder.id));
        continue;
      }
      const recipient = await getUser(recipientId);
      if (!recipient) {
        await db.update(taskRemindersTable).set({ firedAt: now() }).where(eq(taskRemindersTable.id, reminder.id));
        continue;
      }

      const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, task.projectId));
      const taskUrl = `${CLIENT_ORIGIN}/project/${task.projectId}`;

      try {
        await sendEmail(
          recipient.email,
          `Reminder: "${task.title}" is due soon`,
          buildReminderEmail({
            recipientName: recipient.name,
            taskTitle: task.title,
            projectName: project?.name ?? "your project",
            dueDate: task.dueDate,
            minutesBefore: reminder.offsetMinutes,
            taskUrl,
          }),
        );
      } catch (err) {
        console.error("Failed to send reminder email", err);
      }

      // Marking firedAt also makes this reminder show up in the in-app
      // inbox — see GET /reminders/inbox below.
      await db.update(taskRemindersTable).set({ firedAt: now() }).where(eq(taskRemindersTable.id, reminder.id));
    } catch (err) {
      console.error("Failed to process reminder", reminder.id, err);
    }
  }
}

async function addActivity(projectId: string, text: string, kind: "task" | "project" | "member") {
  await db.insert(activityTable).values({ id: randomUUID(), projectId, text, time: "Just now", kind });
}

router.get("/me", async (req, res): Promise<void> => {
  const user = await getUser(req.userId!);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(GetMeResponse.parse(user));
});

function buildInviteEmail(opts: {
  inviterName: string;
  projectName: string;
  inviteUrl: string;
  isExistingUser: boolean;
}) {
  const { inviterName, projectName, inviteUrl, isExistingUser } = opts;

  const introLine = isExistingUser
    ? `${inviterName} has added you to <strong>${projectName}</strong> on Zana. It's now available in your workspace.`
    : `${inviterName} has invited you to collaborate on <strong>${projectName}</strong>, a project managed on Zana.`;

  const ctaLabel = isExistingUser ? "Open the project" : "Accept invitation";

  const html = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #111111;">
    <div style="margin-bottom: 28px;">
      <span style="display: inline-block; width: 32px; height: 32px; line-height: 32px; text-align: center; background: #111111; color: #ffffff; font-weight: 700; font-size: 13px; border-radius: 8px; font-family: monospace;">za</span>
      <span style="font-weight: 800; font-size: 16px; margin-left: 8px; letter-spacing: -0.02em;">zana</span>
    </div>

    <h1 style="font-size: 20px; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 12px;">You've been invited to collaborate</h1>

    <p style="font-size: 14px; line-height: 1.6; color: #333333; margin: 0 0 24px;">
      ${introLine}
    </p>

    <a href="${inviteUrl}" style="display: inline-block; background: #111111; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 22px; border-radius: 8px; margin-bottom: 28px;">
      ${ctaLabel} &rarr;
    </a>

    <p style="font-size: 12px; line-height: 1.6; color: #666666; margin: 0 0 8px;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="font-size: 12px; word-break: break-all; margin: 0 0 28px;">
      <a href="${inviteUrl}" style="color: #111111;">${inviteUrl}</a>
    </p>

    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 0 0 20px;" />

    <p style="font-size: 11px; line-height: 1.6; color: #999999; margin: 0;">
      Zana is a minimal project management tool. You're receiving this email because
      <strong>${inviterName}</strong> invited you to a project using your email address.
      If you weren't expecting this, you can safely ignore this email &mdash; no account will be created without your action.
    </p>
  </div>
  `;

  return html;
}

router.get("/overview", async (req, res): Promise<void> => {
  const projectIds = await myProjectIds(req.userId!);
  if (projectIds.length === 0) {
    res.json(GetOverviewResponse.parse({ projectCount: 0, openTaskCount: 0, completedTaskCount: 0, memberCount: 0, activities: [] }));
    return;
  }
  const projects = await db.select().from(projectsTable).where(inArray(projectsTable.id, projectIds));
  const tasks = await db.select().from(tasksTable).where(inArray(tasksTable.projectId, projectIds));
  const members = await db.select().from(projectMembersTable).where(inArray(projectMembersTable.projectId, projectIds));
  const activities = await db.select().from(activityTable).where(inArray(activityTable.projectId, projectIds)).orderBy(desc(activityTable.createdAt)).limit(6);
  res.json(GetOverviewResponse.parse({
    projectCount: projects.length,
    openTaskCount: tasks.filter((task) => task.status !== "done").length,
    completedTaskCount: tasks.filter((task) => task.status === "done").length,
    memberCount: new Set(members.map((member) => member.userId ?? member.email)).size,
    activities: activities.map((activity) => ({ id: activity.id, text: activity.text, time: iso(activity.createdAt), kind: activity.kind as "task" | "project" | "member" })),
  }));
});

router.get("/projects", async (req, res): Promise<void> => {
  const projectIds = await myProjectIds(req.userId!);
  const projects = projectIds.length
    ? await db.select().from(projectsTable).where(inArray(projectsTable.id, projectIds)).orderBy(desc(projectsTable.updatedAt))
    : [];
  res.json(ListProjectsResponse.parse(await Promise.all(projects.map(projectView))));
});

router.post("/projects", async (req, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const user = await getUser(req.userId!);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const timestamp = now();
  const project = {
    id: randomUUID(),
    name: parsed.data.name,
    description: parsed.data.description ?? "",
    color: parsed.data.color ?? "ink",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await db.insert(projectsTable).values(project);
  await db.insert(projectMembersTable).values({
    id: randomUUID(),
    projectId: project.id,
    userId: user.id,
    email: user.email,
    name: user.name,
    initials: user.initials,
    role: "owner",
    status: "active",
  });
  await addActivity(project.id, `${user.name} created a new project, ${project.name}`, "project");
  res.status(201).json(CreateProjectResponse.parse(await projectView(project)));
});

router.get("/projects/:projectId", async (req, res): Promise<void> => {
  const parsed = GetProjectParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const membership = await getMembership(parsed.data.projectId, req.userId!);
  if (!membership) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, parsed.data.projectId));
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const tasks = await db.select().from(tasksTable).where(eq(tasksTable.projectId, project.id)).orderBy(tasksTable.position);
  const members = await db.select().from(projectMembersTable).where(eq(projectMembersTable.projectId, project.id));
  res.json(GetProjectResponse.parse({
    project: await projectView(project),
    tasks: await Promise.all(tasks.map(taskView)),
    members: members.map((member) => ({ id: member.id, name: member.name, email: member.email, initials: member.initials, role: member.role as "owner" | "member", status: member.status as "active" | "invited" })),
  }));
});

router.patch("/projects/:projectId", async (req, res): Promise<void> => {
  const params = UpdateProjectParams.safeParse(req.params);
  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid project update" });
    return;
  }
  const membership = await getMembership(params.data.projectId, req.userId!);
  if (!membership) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const [project] = await db.update(projectsTable).set({ ...parsed.data, updatedAt: now() }).where(eq(projectsTable.id, params.data.projectId)).returning();
  res.json(UpdateProjectResponse.parse(await projectView(project)));
});

router.delete("/projects/:projectId", async (req, res): Promise<void> => {
  const params = DeleteProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const membership = await getMembership(params.data.projectId, req.userId!);
  if (!membership || membership.role !== "owner") {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  await db.delete(tasksTable).where(eq(tasksTable.projectId, params.data.projectId));
  await db.delete(projectMembersTable).where(eq(projectMembersTable.projectId, params.data.projectId));
  await db.delete(projectsTable).where(eq(projectsTable.id, params.data.projectId));
  res.sendStatus(204);
});

router.get("/projects/:projectId/members", async (req, res): Promise<void> => {
  const params = ListProjectMembersParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const membership = await getMembership(params.data.projectId, req.userId!);
  if (!membership) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const members = await db.select().from(projectMembersTable).where(eq(projectMembersTable.projectId, params.data.projectId));
  res.json(ListProjectMembersResponse.parse(members.map((member) => ({ id: member.id, name: member.name, email: member.email, initials: member.initials, role: member.role as "owner" | "member", status: member.status as "active" | "invited" }))));
});

router.delete("/projects/:projectId/members/:memberId", async (req, res): Promise<void> => {
  const { projectId, memberId } = req.params;

  if (!projectId || !memberId) {
    res.status(400).json({ error: "Project ID and Member ID are required" });
    return;
  }

  const requesterMembership = await getMembership(projectId, req.userId!);
  if (!requesterMembership) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const [targetMember] = await db
    .select()
    .from(projectMembersTable)
    .where(and(eq(projectMembersTable.id, memberId), eq(projectMembersTable.projectId, projectId)));

  if (!targetMember) {
    res.status(404).json({ error: "Member not found" });
    return;
  }

  const isSelf = targetMember.userId === req.userId;
  const isOwner = requesterMembership.role === "owner";

  if (!isOwner && !isSelf) {
    res.status(403).json({ error: "You do not have permission to remove this member" });
    return;
  }

  if (targetMember.role === "owner" && targetMember.id !== requesterMembership.id) {
    res.status(400).json({ error: "Cannot remove the project owner" });
    return;
  }

  if (targetMember.userId) {
    await db
      .update(tasksTable)
      .set({ assigneeId: null, updatedAt: now() })
      .where(and(eq(tasksTable.projectId, projectId), eq(tasksTable.assigneeId, targetMember.userId)));
  }

  await db
    .delete(projectMembersTable)
    .where(and(eq(projectMembersTable.id, memberId), eq(projectMembersTable.projectId, projectId)));

  const displayName = targetMember.name || targetMember.email;
  const activityMessage = targetMember.status === "invited"
    ? `${requesterMembership.name} revoked invite for ${displayName}`
    : isSelf
      ? `${displayName} left the project`
      : `${requesterMembership.name} removed ${displayName}`;

  await addActivity(projectId, activityMessage, "member");

  res.sendStatus(204);
});

router.post("/projects/:projectId/tasks", async (req, res): Promise<void> => {
  const params = CreateTaskParams.safeParse(req.params);
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid task" });
    return;
  }
  const membership = await getMembership(params.data.projectId, req.userId!);
  if (!membership) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const timestamp = now();
  const task = {
    id: randomUUID(),
    projectId: params.data.projectId,
    title: parsed.data.title,
    description: parsed.data.description ?? "",
    status: parsed.data.status,
    assigneeId: parsed.data.assigneeId ?? null,
    createdBy: req.userId!,
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    createdAt: timestamp,
    updatedAt: timestamp,
    position: 0,
  };
  await db.insert(tasksTable).values(task);
  await syncTaskReminders(task.id, task.dueDate, parsed.data.reminderOffsets ?? []);
  await db.update(projectsTable).set({ updatedAt: timestamp }).where(eq(projectsTable.id, task.projectId));
  await addActivity(task.projectId, `${membership.name} created ${task.title}`, "task");

  res.status(201).json(CreateTaskResponse.parse(await taskView(task)));
});

router.patch("/projects/:projectId/tasks/:taskId", async (req, res): Promise<void> => {
  const params = UpdateTaskParams.safeParse(req.params);
  const parsed = UpdateTaskBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid task update" });
    return;
  }
  const membership = await getMembership(params.data.projectId, req.userId!);
  if (!membership) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const [existing] = await db.select().from(tasksTable).where(and(eq(tasksTable.id, params.data.taskId), eq(tasksTable.projectId, params.data.projectId)));
  if (!existing) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  const { reminderOffsets, dueDate: dueDateInput, ...taskFields } = parsed.data;
  const updatePayload: Record<string, unknown> = { ...taskFields, updatedAt: now() };
  if (dueDateInput !== undefined) {
    updatePayload.dueDate = dueDateInput ? new Date(dueDateInput) : null;
  }
  const [task] = await db.update(tasksTable).set(updatePayload).where(eq(tasksTable.id, existing.id)).returning();

  if (dueDateInput !== undefined || reminderOffsets !== undefined) {
    const finalOffsets = reminderOffsets ??
      (await db.select().from(taskRemindersTable).where(eq(taskRemindersTable.taskId, task.id))).map((r) => r.offsetMinutes);
    await syncTaskReminders(task.id, task.dueDate, finalOffsets);
  }

  await db.update(projectsTable).set({ updatedAt: now() }).where(eq(projectsTable.id, existing.projectId));
  res.json(UpdateTaskResponse.parse(await taskView(task)));
});

router.delete("/projects/:projectId/tasks/:taskId", async (req, res): Promise<void> => {
  const params = DeleteTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const membership = await getMembership(params.data.projectId, req.userId!);
  if (!membership) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const deleted = await db.delete(tasksTable).where(and(eq(tasksTable.id, params.data.taskId), eq(tasksTable.projectId, params.data.projectId))).returning();
  if (!deleted[0]) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.sendStatus(204);
});

router.post("/projects/:projectId/invites", async (req, res): Promise<void> => {
  const params = CreateInviteParams.safeParse(req.params);
  const parsed = CreateInviteBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "A valid email is required" });
    return;
  }
  const membership = await getMembership(params.data.projectId, req.userId!);
  if (!membership) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, params.data.projectId));
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const inviter = await getUser(req.userId!);
  const inviterName = inviter?.name ?? membership.name ?? "Your teammate";

  const email = parsed.data.email.trim().toLowerCase();
  const [existing] = await db.select().from(projectMembersTable).where(and(eq(projectMembersTable.projectId, params.data.projectId), eq(projectMembersTable.email, email)));
  if (existing) {
    res.status(409).json({ error: "This person is already part of the project" });
    return;
  }

  const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  const name = existingUser?.name ?? email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  const initials = existingUser?.initials ?? (name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "NA");

  const member = {
    id: randomUUID(),
    projectId: params.data.projectId,
    userId: existingUser?.id ?? null,
    email,
    name,
    initials,
    role: "member",
    status: existingUser ? "active" : "invited",
  };
  await db.insert(projectMembersTable).values(member);
  await addActivity(params.data.projectId, `${membership.name} invited ${email}`, "member");

  // Existing users can jump straight into the project.
  // New users go through signup, carrying the project id so we can redirect
  // them after account creation.
  const inviteUrl = existingUser
    ? `${CLIENT_ORIGIN}/project/${project.id}`
    : `${CLIENT_ORIGIN}/signup?invite=${project.id}`;

  try {
    await sendEmail(
      email,
      `${inviterName} invited you to ${project.name} on Zana`,
      buildInviteEmail({
        inviterName,
        projectName: project.name,
        inviteUrl,
        isExistingUser: !!existingUser,
      }),
    );
  } catch (err) {
    req.log?.error({ err }, "Failed to send invite email");
  }

  res.status(201).json(CreateInviteResponse.parse(member));
});

// In-app reminder inbox: reminders that fired recently, for tasks the
// current user is the assignee or creator of, that they haven't acked yet.
router.get("/reminders/inbox", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const fired = await db
    .select()
    .from(taskRemindersTable)
    .where(and(isNull(taskRemindersTable.ackedAt), lte(taskRemindersTable.firedAt as any, now())));

  const tasksById = new Map<string, typeof tasksTable.$inferSelect>();
  const results: { id: string; taskId: string; taskTitle: string; projectId: string; dueDate: string | null; offsetMinutes: number; firedAt: string }[] = [];

  for (const reminder of fired) {
    if (!reminder.firedAt) continue;
    let task = tasksById.get(reminder.taskId);
    if (!task) {
      const [t] = await db.select().from(tasksTable).where(eq(tasksTable.id, reminder.taskId));
      if (!t) continue;
      task = t;
      tasksById.set(reminder.taskId, t);
    }
    const recipientId = task.assigneeId ?? task.createdBy;
    if (recipientId !== userId) continue;
    results.push({
      id: reminder.id,
      taskId: task.id,
      taskTitle: task.title,
      projectId: task.projectId,
      dueDate: task.dueDate ? iso(task.dueDate) : null,
      offsetMinutes: reminder.offsetMinutes,
      firedAt: iso(reminder.firedAt),
    });
  }

  res.json(results);
});

// Marks a fired reminder as seen so it stops appearing in the inbox.
router.post("/reminders/:id/ack", async (req, res): Promise<void> => {
  const { id } = req.params;
  await db.update(taskRemindersTable).set({ ackedAt: now() }).where(eq(taskRemindersTable.id, id));
  res.sendStatus(204);
});

setInterval(() => {
  processDueReminders().catch((err) => console.error("Reminder loop failed", err));
}, 30_000);

export default router;