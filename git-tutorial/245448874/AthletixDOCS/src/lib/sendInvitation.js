import { base44 } from "@/api/base44Client";

export async function sendInvitation({
  email,
  role,
  invitedById,
  invitedByName,
  patientId = null,
  note = "",
}) {
  const platformRole = role === "admin" ? "admin" : "user";
  await base44.users.inviteUser(email, platformRole);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await base44.entities.Invitation.create({
    email,
    role,
    invited_by_id: invitedById,
    invited_by_name: invitedByName,
    status: "pending",
    patient_id: patientId || "",
    sent_at: new Date().toISOString(),
    expires_at: expiresAt,
    note,
  });
}