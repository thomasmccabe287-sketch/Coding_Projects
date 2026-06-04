import { base44 } from "@/api/base44Client";

export async function sendSystemMessage({
  patientId,
  patientName,
  content,
  messageType,
  isClinical = false,
  atId,
  atName,
}) {
  const convs = await base44.entities.Conversation.filter({ patient_id: patientId, status: "active" });

  const conv = convs[0] || null;
  if (!conv) return;

  await base44.entities.Message.create({
    conversation_id: conv.id,
    sender_id: atId,
    sender_name: "System",
    sender_role: "system",
    content,
    message_type: messageType,
    is_clinical: isClinical,
  });

  await base44.entities.Conversation.update(conv.id, {
    last_message: content.slice(0, 80),
    last_message_at: new Date().toISOString(),
    last_message_sender: "System",
  });

  const participants = await base44.entities.ConversationParticipant.filter({
    conversation_id: conv.id,
  });

  await Promise.all(
    participants
      .filter(p => p.user_id !== atId)
      .map(p =>
        base44.entities.ConversationParticipant.update(p.id, {
          unread_count: (p.unread_count || 0) + 1,
        })
      )
  );
}