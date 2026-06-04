import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

const STORAGE_KEY = "at_selected_team_id";

// Module-level cache — only one fetch ever fires, shared across all components
let cachedTeams = null;
let fetchPromise = null;

function getTeams() {
  if (cachedTeams) return Promise.resolve(cachedTeams);
  if (!fetchPromise) {
    fetchPromise = fetchWithRetry(() => base44.entities.Team.list("name")).then(data => {
      cachedTeams = data;
      return data;
    }).catch(err => {
      fetchPromise = null; // allow retry on error
      throw err;
    });
  }
  return fetchPromise;
}

export function useTeam() {
  const [teams, setTeams] = useState(cachedTeams || []);
  const [selectedTeamId, setSelectedTeamIdState] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [loading, setLoading] = useState(!cachedTeams);

  useEffect(() => {
    if (cachedTeams) { setTeams(cachedTeams); setLoading(false); return; }
    getTeams().then(data => {
      setTeams(data);
      if (!localStorage.getItem(STORAGE_KEY) && data.length > 0) {
        setSelectedTeamIdState(data[0].id);
        localStorage.setItem(STORAGE_KEY, data[0].id);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const setSelectedTeamId = (id) => {
    setSelectedTeamIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  const selectedTeam = teams.find(t => t.id === selectedTeamId) || null;

  return { teams, selectedTeam, selectedTeamId, setSelectedTeamId, loading };
}