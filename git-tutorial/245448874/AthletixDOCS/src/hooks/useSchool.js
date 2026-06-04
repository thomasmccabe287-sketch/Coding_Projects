// Compatibility shim — useSchool is no longer needed in the single-instance model.
// Returns safe no-op defaults so existing imports don't break.
export function useSchool() {
  return {
    schoolId: null,
    schoolName: "",
    isSuperAdmin: false,
    userSchools: [],
    activeSchool: null,
    switchSchool: () => {},
  };
}