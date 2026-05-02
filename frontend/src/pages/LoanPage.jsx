import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { useStudent } from "../context/StudentContext";
import { loanAPI } from "../utils/api";
import toast from "react-hot-toast";

const LOAN_STEPS = ["KYC Verification", "Admit Card Check", "AI Processing"];
const ADMIT_KEYWORDS = ["admit", "acceptance", "offer", "letter", "decision"];
const REQUIRED_KYC_DOCS = [
  { key: "aadhaar", label: "Aadhaar Card", hint: "Front side or full Aadhaar PDF" },
  { key: "pan", label: "PAN Card", hint: "PAN card image or PDF" },
  { key: "photo", label: "Photo with date & signature", hint: "Passport photo/selfie with date and signature" },
  { key: "cibil", label: "CIBIL Score Screenshot", hint: "Credit report screenshot or score statement" },
];
const MAX_KYC_DOC_SIZE = 5 * 1024 * 1024;

export default function LoanPage() {
  const { student, updateStudent } = useStudent();
  const [step, setStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [loanOffer, setLoanOffer] = useState(null);
  const [applyStep, setApplyStep] = useState(0);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);
  const [kycProfile, setKycProfile] = useState(student.kycProfile || null);
  const [kycDocuments, setKycDocuments] = useState({});
  const [kycForm, setKycForm] = useState({
    pan: "",
    aadhaar: "",
    phoneNumber: "",
    dob: "",
    cibilScore: "",
    annualIncome: "",
    currentAddress: "",
  });

  const isLikelyAdmitLetter = (fileName = "") => {
    const normalized = fileName.toLowerCase();
    return ADMIT_KEYWORDS.some((keyword) => normalized.includes(keyword));
  };

  const onDrop = useCallback((files, rejectedFiles) => {
    // Check if files were rejected
    if (rejectedFiles && rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === "file-too-large") {
        toast.error("File too large (max 5MB)");
      } else if (rejection.errors[0]?.code === "file-invalid-type") {
        toast.error("Only PDF, PNG, JPG files accepted");
      } else {
        toast.error("Invalid file");
      }
      return;
    }

    if (!files || files.length === 0) {
      toast.error("Please select a file");
      return;
    }

    const file = files[0];
    
    // Validate file type
    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error(`Invalid file type: ${file.type}. Only PDF and images accepted.`);
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max 5MB.`);
      return;
    }

    // Require admit-like naming to avoid processing unrelated files.
    if (!isLikelyAdmitLetter(file.name)) {
      toast.error("Please upload the original admit letter file (name should include admit/offer/acceptance/decision)");
      return;
    }

    setUploadedFile(file);
    toast.success(`✓ ${file.name} (${(file.size / 1024).toFixed(1)} KB) validated as admit letter`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, 
    accept: { "application/pdf": [".pdf"], "image/*": [".png", ".jpg", ".jpeg"] }, 
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    noClick: false,
    multiple: false,
  });

  const generateMockLoanOffer = (s) => ({
    approved: true,
    amount: Math.round((parseFloat(s.budget) || 60) * 0.85) + "L",
    amountNum: Math.round((parseFloat(s.budget) || 60) * 0.85),
    interestRate: "9.5%",
    tenure: "10 years",
    emi: "₹" + Math.round(((parseFloat(s.budget) || 60) * 0.85 * 100000 * 0.095 / 12) / (1 - Math.pow(1 + 0.095 / 12, -120))).toLocaleString("en-IN"),
    university: s.matchedUniversities?.[0]?.name || "University of Toronto",
    processingTime: "3 business days",
    features: [
      "No collateral required up to ₹40L",
      "Moratorium period during study",
      "Tax benefit under Section 80E",
      "Doorstep document collection",
    ],
    preApprovalCode: "PF" + Math.random().toString(36).substring(2, 8).toUpperCase(),
  });

  const processAdmit = async (fileOverride = null) => {
    const fileToProcess = fileOverride || uploadedFile;

    if (!kycProfile?.verified || !kycProfile?.kycId) {
      toast.error("Complete KYC verification first before checking the admit card");
      return;
    }

    if (!fileToProcess) {
      toast.error("Please upload an admit letter first");
      return;
    }

    // Additional validation
    if (fileToProcess.size === 0) {
      toast.error("File appears to be empty");
      return;
    }

    if (!isLikelyAdmitLetter(fileToProcess.name || "")) {
      toast.error("Invalid document. Upload original admit/offer letter to continue.");
      return;
    }

    setProcessing(true);
    setStep(1);
    toast.loading("🔍 Checking admit card...");
    
    try {
      const res = await loanAPI.processAdmit({
        fileName: fileToProcess?.name,
        fileSize: fileToProcess?.size,
        studentProfile: { name: student.name, gpa: student.gpa, budget: student.budget, targetCountry: student.targetCountry },
      });
      setLoanOffer(res.data.loanOffer);
      updateStudent({ loanEligibility: res.data.loanOffer });
      toast.dismiss();
      toast.success("✅ Loan offer ready! 🎉");
      setStep(2);
    } catch (err) {
      const mockOffer = generateMockLoanOffer(student);
      setLoanOffer(mockOffer);
      updateStudent({ loanEligibility: mockOffer });
      toast.dismiss();
      toast.success("✅ Loan offer generated! (Demo mode) 🎉");
      setStep(2);
    } finally { 
      setProcessing(false); 
    }
  };

  const buildOfferLetterText = (offer) => {
    const now = new Date();
    const date = now.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const applicantName = student.name || "Student";

    return [
      "POONAWALLA FINCORP - PRE-APPROVED EDUCATION LOAN OFFER",
      "=======================================================",
      "",
      `Date: ${date}`,
      `Applicant: ${applicantName}`,
      `Target University: ${offer.university || "As per admit letter"}`,
      `Pre-Approval Code: ${offer.preApprovalCode || "N/A"}`,
      "",
      "OFFER SUMMARY",
      "-------------",
      `Loan Amount: INR ${offer.amount}`,
      `Interest Rate: ${offer.interestRate}`,
      `Tenure: ${offer.tenure}`,
      `Estimated Monthly EMI: ${offer.emi}`,
      `Processing Time: ${offer.processingTime || "3 business days"}`,
      "",
      "FEATURES",
      "--------",
      ...(offer.features || []).map((feature, index) => `${index + 1}. ${feature}`),
      "",
      "IMPORTANT NOTES",
      "---------------",
      "1. This is a pre-approved offer generated for demo and screening purposes.",
      "2. Final disbursal is subject to document verification and underwriting policy.",
      "3. Terms and conditions apply as per lender guidelines.",
      "",
      "Generated by StudyPath AI x Poonawalla Fincorp",
    ].join("\n");
  };

  const handleDownloadOfferLetter = () => {
    if (!loanOffer) {
      toast.error("No loan offer available to download yet");
      return;
    }

    if (!kycProfile?.verified || !kycProfile?.kycId) {
      toast.error("Complete KYC verification before downloading the offer letter");
      return;
    }

    if (kycProfile?.cibilScore <= 60 || kycProfile?.bureauCibilScore <= 60) {
      toast.error("Offer letter is not available because the KYC/CIBIL checks did not pass");
      return;
    }

    try {
      const content = buildOfferLetterText(loanOffer);
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const safeName = (student.name || "student").trim().toLowerCase().replace(/\s+/g, "-");
      const fileName = `offer-letter-${safeName}-${loanOffer.preApprovalCode || "preapproved"}.txt`;

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Offer letter downloaded successfully");
    } catch (error) {
      toast.error("Unable to download offer letter. Please try again.");
    }
  };

  const handleKycFieldChange = (event) => {
    const { name, value } = event.target;
    setKycForm((prev) => ({ ...prev, [name]: value }));
  };

  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const handleKycDocumentChange = (docKey) => (event) => {
    const file = (event.target.files || [])[0];
    if (!file) {
      return;
    }

    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error(`${REQUIRED_KYC_DOCS.find((doc) => doc.key === docKey)?.label || "File"} must be PDF, PNG, or JPG`);
      return;
    }

    if (file.size > MAX_KYC_DOC_SIZE) {
      toast.error(`${REQUIRED_KYC_DOCS.find((doc) => doc.key === docKey)?.label || "File"} is too large. Max 5MB.`);
      return;
    }

    setKycDocuments((prev) => ({ ...prev, [docKey]: file }));
    toast.success(`${REQUIRED_KYC_DOCS.find((doc) => doc.key === docKey)?.label || "Document"} selected`);
  };

  const handleSubmitKyc = async () => {
    if (isSubmittingKyc) {
      return;
    }

    const pan = kycForm.pan.trim().toUpperCase();
    const aadhaar = kycForm.aadhaar.replace(/\D/g, "");
    const phoneNumber = (kycForm.phoneNumber || "").trim();
    const cibilScore = parseFloat(kycForm.cibilScore);
    const income = parseFloat(kycForm.annualIncome);
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

    if (!panRegex.test(pan)) {
      toast.error("Enter valid PAN (e.g. ABCDE1234F)");
      return;
    }

    if (!/^\d{12}$/.test(aadhaar)) {
      toast.error("Aadhaar must be 12 digits");
      return;
    }

    if (!/^(\+?[1-9]\d{7,14}|\d{10})$/.test(phoneNumber.replace(/\s+/g, ""))) {
      toast.error("Enter a valid phone number (10 digits or international format)");
      return;
    }

    if (!kycForm.dob) {
      toast.error("Date of birth is required");
      return;
    }

    const age = Math.floor((Date.now() - new Date(kycForm.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (!Number.isFinite(age) || age < 18) {
      toast.error("Applicant must be 18+ years old");
      return;
    }

    if (Number.isNaN(cibilScore) || cibilScore <= 60) {
      toast.error("CIBIL score must be greater than 60");
      return;
    }

    if (Number.isNaN(income) || income <= 0) {
      toast.error("Annual income must be greater than 0");
      return;
    }

    if ((kycForm.currentAddress || "").trim().length < 10) {
      toast.error("Enter complete current address");
      return;
    }

    const missingDocs = REQUIRED_KYC_DOCS.filter((doc) => !kycDocuments[doc.key]);
    if (missingDocs.length > 0) {
      toast.error(`Upload all required KYC documents: ${missingDocs.map((doc) => doc.label).join(", ")}`);
      return;
    }

    setIsSubmittingKyc(true);
    toast.loading("Verifying KYC details...");

    try {
      const payload = {
        applicantName: student.name || "Student",
        email: student.email || "",
        pan,
        aadhaar,
        phoneNumber,
        dob: kycForm.dob,
        cibilScore,
        annualIncome: income,
        currentAddress: kycForm.currentAddress.trim(),
        documents: REQUIRED_KYC_DOCS.map((doc) => {
          const file = kycDocuments[doc.key];
          return {
            name: file.name,
            type: file.type,
            size: file.size,
            category: doc.key,
          };
        }),
      };

      const res = await loanAPI.submitKYC(payload);
      const verifiedKyc = res?.data?.kyc;
      if (!verifiedKyc?.kycId) {
        throw new Error("KYC verification failed");
      }

      setKycProfile(verifiedKyc);
      updateStudent({ kycProfile: verifiedKyc });
      toast.dismiss();
      toast.success("KYC verified successfully");
    } catch (error) {
      toast.dismiss();
      toast.error(error?.response?.data?.error || "KYC verification failed");
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  const sendOtp = async () => {
    const phone = (kycForm.phoneNumber || "").trim();
    if (!phone) { toast.error('Enter phone number first'); return; }
    setOtpLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/loan/phone/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = data.detail ? `: ${typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)}` : '';
        throw new Error((data.error || 'OTP send failed') + detail);
      }
      setOtpSent(true);
      toast.success('OTP sent' + (data.source === 'local' ? ` (code: ${data.code})` : ''));
    } catch (err) {
      toast.error(err.message || 'Unable to send OTP');
    } finally { setOtpLoading(false); }
  };

  const verifyOtp = async () => {
    const phone = (kycForm.phoneNumber || "").trim();
    if (!phone) { toast.error('Enter phone number first'); return; }
    if (!otpCode) { toast.error('Enter the OTP code'); return; }
    setOtpLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/loan/phone/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, code: otpCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OTP verify failed');
      toast.success('Phone verified');
      // mark local state (optional) — backend will enforce phoneVerified on KYC submit
    } catch (err) {
      toast.error(err.message || 'Unable to verify OTP');
    } finally { setOtpLoading(false); }
  };

  const handleApplyNow = async () => {
    if (!loanOffer) {
      toast.error("Generate loan offer first, then apply");
      return;
    }

    if (isApplying) {
      return;
    }

    if (!kycProfile?.verified || !kycProfile?.kycId) {
      toast.error("Complete KYC verification before applying");
      return;
    }

    setIsApplying(true);
    setApplyStep(1);
    toast.loading("Starting application...");

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      await wait(900);
      setApplyStep(2);
      await wait(900);
      setApplyStep(3);
      await wait(900);

      const payload = {
        applicantName: student.name || "Student",
        email: student.email || "",
        targetCountry: student.targetCountry || "",
        documentName: uploadedFile?.name || "admit_letter_demo.pdf",
        kycId: kycProfile.kycId,
        loanOffer,
      };

      const res = await loanAPI.applyForLoan(payload);
      const submittedApplication = res?.data?.application;

      if (!submittedApplication?.applicationId) {
        throw new Error("Application ID missing");
      }

      setApplicationId(submittedApplication.applicationId);
      updateStudent({ loanApplication: submittedApplication });

      toast.dismiss();
      toast.success("Application submitted successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Application failed. Please try again.");
      setApplyStep(0);
      return;
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-8 py-10 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-white mb-2">💰 Smart Loan Bridge</h1>
        <p className="text-gray-400 mb-8">Upload your admit letter — get a Poonawalla Fincorp loan offer in 60 seconds.</p>
      </motion.div>

      <div className="flex items-center gap-3 mb-10">
        {LOAN_STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all`}
              style={{ background: step >= i ? "#00D4B8" : "rgba(255,255,255,0.1)", color: step >= i ? "#050E1F" : "#555" }}>
              {step > i ? "✓" : i + 1}
            </div>
            <span className="text-sm" style={{ color: step === i ? "#00D4B8" : step > i ? "#888" : "#555" }}>{s}</span>
            {i < LOAN_STEPS.length - 1 && <div className="h-0.5 w-8 rounded" style={{ background: step > i ? "#00D4B8" : "rgba(255,255,255,0.1)" }} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-6 mb-6" style={{ borderColor: kycProfile?.verified ? "rgba(6,214,160,0.5)" : "rgba(255,255,255,0.12)" }}>
              <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <h3 className="font-semibold text-white">Step 1: KYC Verification</h3>
                <span
                  className="text-xs px-3 py-1 rounded-full"
                  style={{
                    background: kycProfile?.verified ? "rgba(6,214,160,0.2)" : "rgba(255,255,255,0.08)",
                    color: kycProfile?.verified ? "#06D6A0" : "#9ca3af",
                    border: kycProfile?.verified ? "1px solid rgba(6,214,160,0.45)" : "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  {kycProfile?.verified ? "Verified" : "Pending"}
                </span>
              </div>

              {!kycProfile?.verified ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input name="pan" value={kycForm.pan} onChange={handleKycFieldChange} placeholder="PAN (ABCDE1234F)" className="bg-transparent border rounded-xl px-3 py-2 text-sm text-white" style={{ borderColor: "rgba(255,255,255,0.2)" }} />
                    <input name="aadhaar" value={kycForm.aadhaar} onChange={handleKycFieldChange} placeholder="Aadhaar (12 digits)" className="bg-transparent border rounded-xl px-3 py-2 text-sm text-white" style={{ borderColor: "rgba(255,255,255,0.2)" }} />
                    <input name="phoneNumber" value={kycForm.phoneNumber} onChange={handleKycFieldChange} placeholder="Phone Number (+91XXXXXXXXXX)" className="bg-transparent border rounded-xl px-3 py-2 text-sm text-white" style={{ borderColor: "rgba(255,255,255,0.2)" }} />
                    <input type="date" name="dob" value={kycForm.dob} onChange={handleKycFieldChange} className="bg-transparent border rounded-xl px-3 py-2 text-sm text-white" style={{ borderColor: "rgba(255,255,255,0.2)", colorScheme: "dark" }} />
                    <input name="cibilScore" value={kycForm.cibilScore} onChange={handleKycFieldChange} placeholder="CIBIL Score (>60)" className="bg-transparent border rounded-xl px-3 py-2 text-sm text-white" style={{ borderColor: "rgba(255,255,255,0.2)" }} />
                    <input name="annualIncome" value={kycForm.annualIncome} onChange={handleKycFieldChange} placeholder="Annual Income (INR)" className="bg-transparent border rounded-xl px-3 py-2 text-sm text-white" style={{ borderColor: "rgba(255,255,255,0.2)" }} />
                  </div>

                  <textarea name="currentAddress" value={kycForm.currentAddress} onChange={handleKycFieldChange} rows={3} placeholder="Current Address" className="w-full bg-transparent border rounded-xl px-3 py-2 text-sm text-white" style={{ borderColor: "rgba(255,255,255,0.2)" }} />

                  <div className="space-y-3">
                    <p className="text-sm text-gray-300">Upload KYC docs, each file max 5MB</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {REQUIRED_KYC_DOCS.map((doc) => {
                        const selectedFile = kycDocuments[doc.key];
                        return (
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleKycDocumentChange(doc.key)} className="hidden" />
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                              style={{ background: "rgba(0,212,184,0.1)", border: "1px solid rgba(0,212,184,0.3)", color: "#00D4B8" }}>
                              <span>📎</span>
                              <span>Choose File</span>
                            </div>
                            <span className="text-gray-400 text-sm">{selectedFile ? selectedFile.name : "No file chosen"}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                    <button onClick={sendOtp} disabled={otpLoading} className="btn-secondary py-2 px-3 disabled:opacity-60">
                      {otpLoading ? 'Sending...' : 'Get OTP'}
                    </button>
                    <input value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="Enter OTP" className="bg-transparent border rounded-xl px-3 py-2 text-sm text-white" />
                    <button onClick={verifyOtp} disabled={otpLoading || !otpSent} className="btn-primary py-2 px-3 disabled:opacity-60">
                      Verify OTP
                    </button>
                  </div>

                  <button onClick={handleSubmitKyc} disabled={isSubmittingKyc} className="btn-secondary w-full py-3 disabled:opacity-60 disabled:cursor-not-allowed mt-3">
                    {isSubmittingKyc ? "Verifying KYC..." : "Complete KYC Verification"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-sm text-gray-300 space-y-1">
                  <p>✓ KYC ID: <span className="text-teal-300">{kycProfile.kycId}</span></p>
                  <p>✓ PAN: {kycProfile.panMasked}</p>
                  <p>✓ Aadhaar: {kycProfile.aadhaarMasked}</p>
                  <p>✓ Phone: {kycProfile.phoneMasked || "Not available"}</p>
                  <p>✓ CIBIL: {kycProfile.cibilScore}</p>
                  <p>✓ Current Address: {kycProfile.currentAddress}</p>
                  <p>✓ Bureau CIBIL: {kycProfile.bureauCibilScore}</p>
                  <p>
                    ✓ Phone Verification: {kycProfile.phoneVerification?.valid ? "Valid" : "Invalid"}
                    {kycProfile.phoneVerification?.source ? ` (${kycProfile.phoneVerification.source})` : ""}
                  </p>
                  {kycProfile.phoneVerification?.lineType && (
                    <p>✓ Phone Line Type: {kycProfile.phoneVerification.lineType}</p>
                  )}
                  <p>
                    ✓ Real Customer Check: {kycProfile.phoneVerification?.isRealCustomer === null ? "Pending Twilio integration" : kycProfile.phoneVerification?.isRealCustomer ? "Likely real" : "Needs review"}
                  </p>
                  <p>✓ KYC Files: Aadhaar, PAN, Photo with date/signature, CIBIL screenshot</p>
                  <p>✓ File Limit: 5MB max per file</p>
                  <p>✓ Rule: CIBIL score must be greater than 60 to apply</p>
                  <p>✓ Verified At: {new Date(kycProfile.verifiedAt).toLocaleString("en-IN")}</p>
                  </div>

                  {kycProfile?.verificationChecks && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {Object.entries(kycProfile.verificationChecks).map(([key, value]) => (
                        <div key={key} className="px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <span className="text-gray-400">{key}: </span>
                          <span style={{ color: value === true ? "#06D6A0" : value === false ? "#FF6B6B" : "#FACC15" }}>
                            {value === true ? "pass" : value === false ? "fail" : "pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {student.name && (
              <div className="glass-card p-5 mb-6 flex items-center justify-between flex-wrap gap-4"
                style={{ borderColor: "rgba(6,214,160,0.4)" }}>
                <div>
                  <p className="text-sm text-gray-400">Checking eligibility for</p>
                  <p className="font-semibold text-white">{student.name} · CGPA {student.gpa || "8.1"} · Budget ₹{student.budget || "65"}L</p>
                </div>
                <div className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: "rgba(6,214,160,0.2)", border: "1px solid rgba(6,214,160,0.5)", color: "#06D6A0" }}>
                  ✓ Pre-qualified
                </div>
              </div>
            )}

            <div {...getRootProps()} className="glass-card p-12 text-center cursor-pointer transition-all"
              style={{ borderColor: isDragActive ? "#00D4B8" : uploadedFile ? "rgba(6,214,160,0.5)" : "rgba(0,212,184,0.2)", borderStyle: "dashed", borderWidth: "2px", opacity: kycProfile?.verified ? 1 : 0.65 }}>
              <input {...getInputProps()} />
              {uploadedFile ? (
                <div>
                  <div className="text-5xl mb-4">📄</div>
                  <p className="text-white font-semibold">{uploadedFile.name}</p>
                  <p className="text-gray-400 text-sm mt-1">{(uploadedFile.size / 1024).toFixed(1)} KB · Ready to process</p>
                  <div className="mt-4 space-y-1 text-xs text-gray-500">
                    <p>✓ File type: {uploadedFile.type || "document"}</p>
                    <p>✓ File size: {(uploadedFile.size / 1024).toFixed(1)} KB (max 5MB)</p>
                    <p>✓ Status: Valid admit letter</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-5xl mb-4">{isDragActive ? "📥" : "📤"}</div>
                  <p className="text-white font-semibold mb-2">{isDragActive ? "Drop it here!" : "Upload your admit letter"}</p>
                  <p className="text-gray-400 text-sm">{kycProfile?.verified ? "Drag & drop or click · PDF, PNG, JPG accepted (max 5MB)" : "Complete KYC first, then upload the admit letter"}</p>
                  <div className="mt-4 text-xs text-gray-500 space-y-1">
                    <p>✓ Accepts: PDF, PNG, JPG files only</p>
                    <p>✓ Max size: 5MB</p>
                    <p>✓ File name should include admit/offer/acceptance/decision</p>
                    <p>✓ One file at a time</p>
                  </div>
                </div>
              )}
            </div>

            {uploadedFile && (
              <button onClick={processAdmit} disabled={!kycProfile?.verified} className="btn-primary w-full mt-4 py-4 text-lg disabled:opacity-60 disabled:cursor-not-allowed">
                Process Admit & Get Loan Offer →
              </button>
            )}

            <button onClick={() => {
              const demoFile = { name: "admit_letter_demo.pdf", size: 204800, type: "application/pdf" };
              setUploadedFile(demoFile);
              processAdmit(demoFile);
            }}
              className="btn-secondary w-full mt-3 py-3 text-sm">
              Demo: Use sample admit letter
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card p-12 text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse"
              style={{ background: "rgba(0,212,184,0.2)", border: "2px solid #00D4B8" }}>
              <span className="text-2xl">🤖</span>
            </div>
            <h2 className="font-display text-2xl text-white mb-2">Admit Card Check</h2>
            <p className="text-gray-400 mb-4 text-sm">File: <span className="text-teal-400 font-mono">{uploadedFile?.name}</span></p>
            <p className="text-gray-400 mb-8">Checking the admit card first, then sending verified details into AI loan processing...</p>
            <div className="space-y-3 text-left max-w-sm mx-auto">
              {[
                { step: "📋 Validating admit card", desc: "Checking file integrity" },
                { step: "🎓 Extracting university data", desc: "Reading admit letter details" },
                { step: "✓ Verifying university ranking", desc: "Cross-checking with database" },
                { step: "💰 AI loan eligibility check", desc: "Based on your profile" },
                { step: "📊 Calculating best offer", desc: "EMI and tenure optimization" }
              ].map((item, i) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center animate-pulse text-xs"
                    style={{ background: "rgba(0,212,184,0.4)", animationDelay: `${i * 0.2}s`, color: "#00D4B8" }}>
                    {i < 2 ? "✓" : "○"}
                  </div>
                  <div className="text-left">
                    <div className="text-sm text-gray-300 font-medium">{item.step}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-xs text-gray-600">Processing... ~3 seconds</div>
          </motion.div>
        )}

        {step === 2 && loanOffer && (
          <motion.div key="offer" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="glass-card p-8 text-center mb-6" style={{ background: "linear-gradient(135deg, rgba(6,214,160,0.15), rgba(0,212,184,0.1))", borderColor: "rgba(6,214,160,0.5)" }}>
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="font-display text-3xl font-bold text-white mb-2">Congratulations, {student.name || "Student"}!</h2>
              <p className="text-gray-300">Your Poonawalla Fincorp loan offer is ready.</p>
              <div className="mt-4 px-4 py-2 rounded-full inline-block text-sm font-mono"
                style={{ background: "rgba(0,212,184,0.2)", color: "#00D4B8", border: "1px solid rgba(0,212,184,0.4)" }}>
                Pre-Approval Code: {loanOffer.preApprovalCode}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Loan Amount", val: `₹${loanOffer.amount}`, color: "#06D6A0" },
                { label: "Interest Rate", val: loanOffer.interestRate, color: "#00D4B8" },
                { label: "Tenure", val: loanOffer.tenure, color: "#FFD166" },
                { label: "Monthly EMI", val: loanOffer.emi, color: "#9B59FF" },
              ].map((d) => (
                <div key={d.label} className="glass-card p-4 text-center">
                  <div className="text-xl font-bold font-display mb-1" style={{ color: d.color }}>{d.val}</div>
                  <div className="text-gray-400 text-xs">{d.label}</div>
                </div>
              ))}
            </div>

            <div className="glass-card p-6 mb-6">
              <h3 className="font-semibold text-white mb-4">What's included in your offer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {loanOffer.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span style={{ color: "#06D6A0" }}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleApplyNow}
                disabled={isApplying}
                className="btn-primary flex-1 py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isApplying ? "Applying..." : "Apply Now — 3 Steps"}
              </button>
              <button
                onClick={handleDownloadOfferLetter}
                disabled={!kycProfile?.verified || !loanOffer}
                className="btn-secondary flex-1 py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Download Offer Letter
              </button>
            </div>

            {applyStep > 0 && (
              <div className="glass-card p-5 mt-4" style={{ borderColor: "rgba(0,212,184,0.35)" }}>
                <h4 className="text-white font-semibold mb-3">Application Progress</h4>
                <div className="space-y-2 text-sm">
                  {["KYC + current address verified", "Loan terms confirmed", "Application sent to Poonawalla"].map((label, index) => {
                    const current = index + 1;
                    const done = applyStep > current || (current === 3 && applyStep === 3 && !isApplying);
                    const active = applyStep === current;

                    return (
                      <div key={label} className="flex items-center gap-3">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                          style={{
                            background: done || active ? "rgba(0,212,184,0.25)" : "rgba(255,255,255,0.08)",
                            color: done || active ? "#00D4B8" : "#6b7280",
                            border: done || active ? "1px solid rgba(0,212,184,0.45)" : "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          {done ? "✓" : current}
                        </span>
                        <span style={{ color: done || active ? "#e5e7eb" : "#9ca3af" }}>
                          {label}
                          {active && isApplying ? "..." : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {applyStep === 3 && applicationId && !isApplying && (
                  <p className="mt-4 text-sm" style={{ color: "#06D6A0" }}>
                    Submitted. Application ID: {applicationId}
                  </p>
                )}
              </div>
            )}

            <p className="text-center text-gray-500 text-xs mt-4">
              Processing time: {loanOffer.processingTime} · Subject to final verification · Poonawalla Fincorp Ltd.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
