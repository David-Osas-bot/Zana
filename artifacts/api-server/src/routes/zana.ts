import { Router, type IRouter } from "express";
import { and, desc, eq, inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { Resend } from "resend";
import { db, activityTable, projectMembersTable, projectsTable, tasksTable, usersTable } from "@workspace/db";
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

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM ?? "onboarding@resend.dev";
const CLIENT_ORIGIN = (process.env.CLIENT_ORIGIN ?? "http://localhost:5173").split(",")[0].trim();

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
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status as "not_done" | "doing" | "done",
    assigneeId: task.assigneeId,
    assigneeName: member?.name ?? null,
    assigneeInitials: member?.initials ?? null,
    createdAt: iso(task.createdAt),
    updatedAt: iso(task.updatedAt),
  };
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
  // await addActivity(`${user.name} created a new project, ${project.name}`, "project");
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
    createdAt: timestamp,
    updatedAt: timestamp,
    position: 0,
  };
  await db.insert(tasksTable).values(task);
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
  const [task] = await db.update(tasksTable).set({ ...parsed.data, updatedAt: now() }).where(eq(tasksTable.id, existing.id)).returning();
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

  const email = parsed.data.email.trim().toLowerCase();
  const [existing] = await db.select().from(projectMembersTable).where(and(eq(projectMembersTable.projectId, params.data.projectId), eq(projectMembersTable.email, email)));
  if (existing) {
    res.status(409).json({ error: "This person is already part of the project" });
    return;
  }

  // const name = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  // const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "NA";
  // const member = { id: randomUUID(), projectId: params.data.projectId, userId: null, email, name, initials, role: "member", status: "invited" };
  // await db.insert(projectMembersTable).values(member);
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

  if (resend) {
    // Existing users can jump straight into the project.
    // New users go through signup, carrying the project id so we can redirect them after account creation.
    const inviteUrl = existingUser
      ? `${CLIENT_ORIGIN}/project/${project.id}`
      : `${CLIENT_ORIGIN}/signup?invite=${project.id}`;

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `${membership.name} invited you to ${project.name} on Zana`,
        html: `<p>${membership.name} invited you to collaborate on <strong>${project.name}</strong> on Zana.</p><p><a href="${inviteUrl}">Open ${project.name} on Zana</a></p>`,
      });
    } catch (err) {
      req.log?.error({ err }, "Failed to send invite email");
    }
  }
  res.status(201).json(CreateInviteResponse.parse(member));
});

export default router;