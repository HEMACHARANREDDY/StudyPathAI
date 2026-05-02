import { createContext, useContext, useState, useEffect } from "react";

const StudentContext = createContext();

const DEFAULT_STUDENT = {
  name: "",
  email: "",
  gpa: "",
  gre: "",
  ielts: "",
  budget: "",
  targetCountry: "",
  preferredField: "",
  workExperience: "",
  dreamScore: null,
  matchedUniversities: [],
  journeyPlan: [],
  loanEligibility: null,
  kycProfile: null,
  loanApplication: null,
  admitData: null,
  streakDays: 3,
  completedTasks: [],
  isAuthenticated: false,
};

export const StudentProvider = ({ children }) => {
  const [student, setStudent] = useState(() => {
    // Load from localStorage on init and merge with default fields
    const saved = localStorage.getItem("studentProfile");
    return saved ? { ...DEFAULT_STUDENT, ...JSON.parse(saved) } : DEFAULT_STUDENT;
  });

  // Save to localStorage whenever student changes
  useEffect(() => {
    localStorage.setItem("studentProfile", JSON.stringify(student));
  }, [student]);

  const updateStudent = (data) => setStudent((prev) => ({ ...prev, ...data }));

  return (
    <StudentContext.Provider value={{ student, updateStudent }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => useContext(StudentContext);
