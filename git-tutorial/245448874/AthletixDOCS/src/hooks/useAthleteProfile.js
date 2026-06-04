import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

export default function useAthleteProfile() {
  const { user } = useAuth();
  const [myPatient, setMyPatient] = useState(undefined);
  const [activeInjury, setActiveInjury] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    if (!user) return;
    const patients = await base44.entities.Patient.list();
    const patient = patients.find(p => p.user_id === user.id) || null;
    setMyPatient(patient);
    if (patient) {
      const injuries = await base44.entities.Injury.filter({ patient_id: patient.id, status: "active" });
      setActiveInjury(injuries[0] || null);
    }
    setLoading(false);
  };

  useEffect(() => { reload(); }, [user?.id]);

  return { myPatient, activeInjury, loading, reload, user };
}