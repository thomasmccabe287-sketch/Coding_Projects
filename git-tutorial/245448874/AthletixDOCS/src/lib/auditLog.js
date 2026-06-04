import { base44 } from "@/api/base44Client";

export async function writeAuditLog({
  user,
  action,
  entityType,
  patientId = "",
  fieldName = "",
  oldValue = "",
  newValue = "",
}) {
  if (!user) return;
  base44.entities.AuditLog.create({
    user_id: user.id,
    user_name: user.full_name || user.email || "",
    user_role: user.role || "",
    action,
    entity_type: entityType,
    patient_id: patientId,
    field_name: fieldName,
    old_value: String(oldValue).slice(0, 500),
    new_value: String(newValue).slice(0, 500),
  }).catch(() => {});
}