const express = require("express");
const router = express.Router();

// In-memory storage
const applications = [];
const referrals = [];
const emailQueue = [];

// =====================================================
// 1. EMI CALCULATOR (Advanced loan scenario modeling)
// =====================================================
router.post("/emi-calculate", (req, res) => {
  try {
    const { loanAmount, interestRate, tenure, processingFee } = req.body;
    
    if (!loanAmount || !interestRate || !tenure) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100 / 12; // Monthly rate
    const months = parseFloat(tenure) * 12;
    const fee = parseFloat(processingFee || 0);

    // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    const emi = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    const totalPayment = emi * months + fee;
    const totalInterest = totalPayment - principal;

    res.json({
      monthlyEmi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      processingFee: fee,
      scenarioDetails: {
        principal,
        rate: interestRate,
        tenure,
        months,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// 2. EMAIL NOTIFICATIONS
// =====================================================
router.post("/send-notification", async (req, res) => {
  try {
    const { email, type, data } = req.body;
    
    if (!email || !type) {
      return res.status(400).json({ error: "Email and type required" });
    }

    const notification = {
      id: `NOTIF-${Date.now()}`,
      email,
      type, // otp, application_status, offer_letter, referral_bonus
      data,
      sentAt: new Date().toISOString(),
      status: "queued",
    };

    emailQueue.push(notification);

    // Simulate email sending
    const emailContent = generateEmailContent(type, data, email);
    console.log(`[EMAIL] To: ${email}, Type: ${type}`);
    console.log(emailContent);

    res.json({ success: true, notificationId: notification.id, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function generateEmailContent(type, data, email) {
  const templates = {
    otp: `Hello,\n\nYour OTP is: ${data.otp}\nValid for 5 minutes.\n\nStudyPath AI`,
    application_status: `Your application ${data.applicationId} status: ${data.status}\n\nDetails: ${JSON.stringify(data)}\n\nStudyPath AI`,
    offer_letter: `Congratulations! Your loan offer is ready.\n\nOffer Details:\n${JSON.stringify(data)}\n\nStudyPath AI`,
    referral_bonus: `You earned ₹${data.bonus}! Referral by ${data.referrerName}.\n\nStudyPath AI`,
  };
  return templates[type] || "Notification from StudyPath AI";
}

// =====================================================
// 3. APPLICATION TRACKING DASHBOARD
// =====================================================
router.get("/applications/:applicantEmail", (req, res) => {
  try {
    const { applicantEmail } = req.params;
    const userApps = applications.filter((a) => a.email === applicantEmail);

    res.json({
      total: userApps.length,
      applications: userApps.map((app) => ({
        applicationId: app.applicationId,
        status: app.status,
        stage: app.stage || "kyc", // kyc, submitted, processing, approved, rejected
        progress: calculateProgress(app.stage),
        submittedAt: app.submittedAt,
        loanAmount: app.loanAmount,
        university: app.university,
        nextStep: getNextStep(app.stage),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function calculateProgress(stage) {
  const stages = { kyc: 25, submitted: 50, processing: 75, approved: 100, rejected: 100 };
  return stages[stage] || 0;
}

function getNextStep(stage) {
  const steps = {
    kyc: "Complete KYC verification",
    submitted: "Under document verification",
    processing: "Awaiting final approval",
    approved: "Download offer letter",
    rejected: "Contact support",
  };
  return steps[stage] || "Pending";
}

router.post("/applications/track", (req, res) => {
  try {
    const { applicationId, stage, status, notes } = req.body;
    const app = applications.find((a) => a.applicationId === applicationId);

    if (!app) {
      return res.status(404).json({ error: "Application not found" });
    }

    app.stage = stage;
    app.status = status;
    app.lastUpdate = new Date().toISOString();
    if (notes) app.notes = notes;

    // Send notification on status change
    emailQueue.push({
      email: app.email,
      type: "application_status",
      data: { applicationId, status, stage },
    });

    res.json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// 4. AI DOCUMENT INSIGHTS (Mock OCR/extraction)
// =====================================================
router.post("/extract-document-data", async (req, res) => {
  try {
    const { docType, documentName } = req.body;

    // Mock AI extraction based on document type
    const mockInsights = {
      aadhaar: {
        extractedFields: {
          name: "John Doe",
          aadharNumber: "123456789012",
          dob: "1998-05-15",
          address: "123 Main St, City",
        },
        confidence: 0.95,
        flaggedIssues: [],
      },
      pan: {
        extractedFields: {
          name: "JOHN DOE",
          panNumber: "ABCDE1234F",
          dob: "1998-05-15",
        },
        confidence: 0.98,
        flaggedIssues: [],
      },
      photo: {
        extractedFields: {
          faceDetected: true,
          qualityScore: 0.92,
          dateOnPhoto: "2026-05-01",
          backgroundClear: true,
        },
        confidence: 0.88,
        flaggedIssues: ["Slight shadow on left side"],
      },
      cibil: {
        extractedFields: {
          score: 750,
          reportDate: "2026-04-20",
          accountsActive: 3,
          delayedPayments: 0,
        },
        confidence: 0.99,
        flaggedIssues: [],
      },
    };

    const insights = mockInsights[docType] || { error: "Unknown document type" };
    res.json({
      docType,
      documentName,
      insights,
      aiSummary: `AI analysis complete. Confidence: ${insights.confidence * 100}%. Ready for review.`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// 5. UNIVERSITY-LOAN COMPARISON MATRIX
// =====================================================
router.get("/university-comparison", (req, res) => {
  try {
    const universities = [
      {
        name: "University of Toronto",
        country: "Canada",
        annualFee: 65000,
        avgLoanAmount: 52000,
        interestRate: 9.5,
        popularloanTenure: 10,
        applicantReview: 4.8,
      },
      {
        name: "University of Melbourne",
        country: "Australia",
        annualFee: 45000,
        avgLoanAmount: 36000,
        interestRate: 9.2,
        popularloanTenure: 8,
        applicantReview: 4.7,
      },
      {
        name: "UC Berkeley",
        country: "USA",
        annualFee: 75000,
        avgLoanAmount: 60000,
        interestRate: 10.5,
        popularloanTenure: 12,
        applicantReview: 4.9,
      },
      {
        name: "University of Oxford",
        country: "UK",
        annualFee: 55000,
        avgLoanAmount: 44000,
        interestRate: 8.8,
        popularloanTenure: 9,
        applicantReview: 4.8,
      },
    ];

    res.json({
      universities: universities.map((u) => ({
        ...u,
        emiEstimate: calculateEMI(u.avgLoanAmount, u.interestRate, u.popularloanTenure),
        totalCost: u.annualFee * 4 + u.avgLoanAmount * (1 + u.interestRate / 100),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function calculateEMI(principal, rate, years) {
  const monthlyRate = rate / 100 / 12;
  const months = years * 12;
  return Math.round((principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1));
}

router.post("/university-scenario", (req, res) => {
  try {
    const { universityName, budget, targetTenure } = req.body;
    const uni = [
      { name: "University of Toronto", fee: 65000 },
      { name: "University of Melbourne", fee: 45000 },
      { name: "UC Berkeley", fee: 75000 },
      { name: "University of Oxford", fee: 55000 },
    ].find((u) => u.name === universityName);

    if (!uni) return res.status(404).json({ error: "University not found" });

    const loanNeeded = Math.max(0, uni.fee * 4 - budget);
    const emi = calculateEMI(loanNeeded, 9.5, targetTenure);

    res.json({
      university: universityName,
      totalCost: uni.fee * 4,
      studentContribution: budget,
      loanRequired: loanNeeded,
      estimatedEmi: emi,
      tenureYears: targetTenure,
      affordability: emi <= budget * 0.3 ? "Affordable" : "Stretch budget",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// 6. EXPORT AS PDF (Mock - returns base64 or file path)
// =====================================================
router.post("/export-application-pdf", (req, res) => {
  try {
    const { applicationId, format } = req.body;
    
    const mockPdfContent = Buffer.from(`
      APPLICATION REPORT
      Application ID: ${applicationId}
      Generated: ${new Date().toISOString()}
      Status: Submitted
      Loan Amount: ₹52,00,000
      University: University of Toronto
      Applicant: John Doe
      
      KYC Status: Verified
      CIBIL Score: 750+
      Phone Verified: Yes
      
      Offer Details:
      Interest Rate: 9.5%
      Tenure: 10 years
      EMI: ₹55,000/month
    `).toString("base64");

    res.json({
      success: true,
      format: format || "pdf",
      fileName: `application-${applicationId}.pdf`,
      base64: mockPdfContent,
      downloadUrl: `/api/download/${applicationId}.pdf`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// 7. ADMIN DASHBOARD
// =====================================================
router.get("/admin/dashboard", (req, res) => {
  try {
    const stats = {
      totalApplications: applications.length,
      approvedCount: applications.filter((a) => a.status === "approved").length,
      pendingCount: applications.filter((a) => a.status === "submitted").length,
      rejectedCount: applications.filter((a) => a.status === "rejected").length,
      totalLoanAmount: applications.reduce((sum, a) => sum + (a.loanAmount || 0), 0),
      conversionRate: (
        (applications.filter((a) => a.status === "approved").length / applications.length || 1) * 100
      ).toFixed(2) + "%",
      recentApplications: applications.slice(-5),
      topUniversities: getTopUniversities(),
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function getTopUniversities() {
  const uniMap = {};
  applications.forEach((a) => {
    if (a.university) {
      uniMap[a.university] = (uniMap[a.university] || 0) + 1;
    }
  });
  return Object.entries(uniMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
}

router.get("/admin/applications", (req, res) => {
  try {
    res.json({
      total: applications.length,
      applications: applications.map((a) => ({
        applicationId: a.applicationId,
        applicantName: a.applicantName,
        email: a.email,
        status: a.status,
        loanAmount: a.loanAmount,
        university: a.university,
        submittedAt: a.submittedAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/admin/application-action", (req, res) => {
  try {
    const { applicationId, action, reason } = req.body; // action: approve, reject
    const app = applications.find((a) => a.applicationId === applicationId);

    if (!app) {
      return res.status(404).json({ error: "Application not found" });
    }

    app.status = action === "approve" ? "approved" : "rejected";
    app.adminAction = { action, reason, timestamp: new Date().toISOString() };

    // Send email notification
    emailQueue.push({
      email: app.email,
      type: "application_status",
      data: { applicationId, status: app.status, reason },
    });

    res.json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// 8. REFERRAL SYSTEM
// =====================================================
router.post("/referral/generate-code", (req, res) => {
  try {
    const { userEmail, userName } = req.body;
    const code = `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const referralCode = {
      code,
      userEmail,
      userName,
      createdAt: new Date().toISOString(),
      clicks: 0,
      conversions: 0,
      earnedBonus: 0,
      referredUsers: [],
    };

    referrals.push(referralCode);

    res.json({
      code,
      shareLink: `${process.env.FRONTEND_URL}/register?ref=${code}`,
      bonusPerReferral: "₹500",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/referral/track", (req, res) => {
  try {
    const { referralCode, action } = req.body; // action: click, conversion
    const ref = referrals.find((r) => r.code === referralCode);

    if (!ref) {
      return res.status(404).json({ error: "Referral code not found" });
    }

    if (action === "click") ref.clicks++;
    if (action === "conversion") {
      ref.conversions++;
      ref.earnedBonus += 500;
      emailQueue.push({
        email: ref.userEmail,
        type: "referral_bonus",
        data: { bonus: 500, referrerName: "New User" },
      });
    }

    res.json({ success: true, referral: ref });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/referral/status/:referralCode", (req, res) => {
  try {
    const { referralCode } = req.params;
    const ref = referrals.find((r) => r.code === referralCode);

    if (!ref) {
      return res.status(404).json({ error: "Referral code not found" });
    }

    res.json({
      code: ref.code,
      clicks: ref.clicks,
      conversions: ref.conversions,
      earnedBonus: ref.earnedBonus,
      conversionRate: ((ref.conversions / ref.clicks) * 100 || 0).toFixed(2) + "%",
      referredUsers: ref.referredUsers.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// 9. SCHOLARSHIP FINDER
// =====================================================
router.post("/scholarships/find", async (req, res) => {
  try {
    const { gpa, country, field, budget, meritScore } = req.body;

    // Mock AI-powered scholarship matching
    const scholarships = [
      {
        name: "Merit-Based Excellence Scholarship",
        provider: "Global Education Foundation",
        amount: "₹2,00,000",
        eligibility: "GPA > 8.5, Any field",
        deadline: "2026-08-15",
        matchScore: gpa >= 8.5 ? 95 : 70,
        requirements: ["Academic transcripts", "LOR", "SOP"],
      },
      {
        name: "Country-Specific Grant",
        provider: country + " Government",
        amount: "₹1,50,000",
        eligibility: `Students going to ${country}`,
        deadline: "2026-07-30",
        matchScore: 88,
        requirements: ["Acceptance letter", "Financial statement"],
      },
      {
        name: "STEM Innovation Award",
        provider: "Tech Foundation",
        amount: "₹3,00,000",
        eligibility: "STEM fields, GPA > 8.0",
        deadline: "2026-09-01",
        matchScore: ["Computer Science", "Engineering"].includes(field) && gpa >= 8.0 ? 92 : 60,
        requirements: ["Project portfolio", "Research proposal"],
      },
      {
        name: "Women in Tech Scholarship",
        provider: "Women Empowerment Fund",
        amount: "₹1,00,000",
        eligibility: "Female students in tech",
        deadline: "2026-06-30",
        matchScore: 85,
        requirements: ["Gender certificate", "Tech project"],
      },
      {
        name: "Need-Based Support",
        provider: "Education Welfare Trust",
        amount: "₹75,000",
        eligibility: "Annual income < ₹8L",
        deadline: "2026-10-15",
        matchScore: budget < 800000 ? 90 : 40,
        requirements: ["Income certificate", "Bank statements"],
      },
    ];

    const matchedScholarships = scholarships
      .filter(s => s.matchScore >= 70)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);

    res.json({
      totalFound: matchedScholarships.length,
      scholarships: matchedScholarships,
      summary: `Found ${matchedScholarships.length} scholarships matching your profile. Total potential funding: ₹${matchedScholarships.reduce((sum, s) => sum + parseInt(s.amount.replace(/[^\d]/g, '')), 0).toLocaleString()}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// 10. VISA CHECKLIST GENERATOR
// =====================================================
router.post("/visa/checklist", (req, res) => {
  try {
    const { country, visaType, studyLevel } = req.body;

    const baseChecklists = {
      usa: {
        f1: {
          documents: [
            { item: "I-20 Form", status: "pending", deadline: "30 days before travel", notes: "From university" },
            { item: "DS-160 Form", status: "pending", deadline: "Appointment + 3 days", notes: "Online application" },
            { item: "SEVIS Fee Receipt", status: "pending", deadline: "Before DS-160", notes: "Pay $350 online" },
            { item: "Visa Fee Payment", status: "pending", deadline: "Appointment day", notes: "$185 for F-1" },
            { item: "Passport", status: "pending", deadline: "6 months validity", notes: "Valid for 6 months beyond stay" },
            { item: "Photo", status: "pending", deadline: "Appointment day", notes: "2x2 inches, white background" },
            { item: "Appointment Letter", status: "pending", deadline: "Appointment scheduled", notes: "From VFS/Embassy" },
          ],
          steps: [
            "Receive I-20 from university",
            "Pay SEVIS fee ($350)",
            "Complete DS-160 form",
            "Schedule visa appointment",
            "Attend visa interview",
            "Receive passport with visa",
          ],
        },
      },
      canada: {
        study: {
          documents: [
            { item: "Acceptance Letter", status: "pending", deadline: "Before application", notes: "From DLI" },
            { item: "Proof of Funds", status: "pending", deadline: "Application time", notes: "CAD $10,000 + tuition" },
            { item: "Medical Certificate", status: "pending", deadline: "Application time", notes: "Within 1 year" },
            { item: "Police Certificate", status: "pending", deadline: "Application time", notes: "Criminal record check" },
            { item: "Passport", status: "pending", deadline: "6 months validity", notes: "Valid for travel" },
          ],
          steps: [
            "Get university acceptance",
            "Apply for study permit online",
            "Submit biometrics",
            "Medical examination",
            "Visa decision (usually 2-4 weeks)",
          ],
        },
      },
      uk: {
        student: {
          documents: [
            { item: "CAS Number", status: "pending", deadline: "Before application", notes: "From university" },
            { item: "Financial Proof", status: "pending", deadline: "Application time", notes: "£1,334/month" },
            { item: "TB Test Results", status: "pending", deadline: "Application time", notes: "If from high-risk country" },
            { item: "Passport", status: "pending", deadline: "5 years validity", notes: "Valid for entire stay" },
          ],
          steps: [
            "Get university offer",
            "Apply for visa online",
            "Pay visa fee (£363)",
            "Biometric appointment",
            "Visa decision",
          ],
        },
      },
    };

    const checklist = baseChecklists[country]?.[visaType] || {
      documents: [{ item: "Contact embassy", status: "pending", deadline: "ASAP", notes: "Country-specific requirements vary" }],
      steps: ["Research requirements", "Contact embassy", "Prepare documents", "Apply"],
    };

    res.json({
      country: country.toUpperCase(),
      visaType,
      studyLevel,
      checklist,
      estimatedTimeline: "2-8 weeks",
      totalDocuments: checklist.documents.length,
      completionRate: 0,
      tips: [
        "Start early - visa processes can take time",
        "Keep all documents organized",
        "Make copies of everything",
        "Check embassy website for updates",
      ],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// 11. DOCUMENT ORGANIZER
// =====================================================
const documentStorage = {}; // email -> documents array

router.post("/documents/upload", (req, res) => {
  try {
    const { email, documentType, fileName, fileSize, category } = req.body;

    if (!documentStorage[email]) {
      documentStorage[email] = [];
    }

    const document = {
      id: `DOC-${Date.now()}`,
      type: documentType,
      name: fileName,
      size: fileSize,
      category: category || "general",
      uploadedAt: new Date().toISOString(),
      status: "uploaded",
      tags: generateTags(documentType),
      aiInsights: getDocumentInsights(documentType),
    };

    documentStorage[email].push(document);

    res.json({
      success: true,
      document,
      totalDocuments: documentStorage[email].length,
      message: `${fileName} uploaded successfully`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/documents/:email", (req, res) => {
  try {
    const { email } = req.params;
    const { category } = req.query;

    let documents = documentStorage[email] || [];

    if (category) {
      documents = documents.filter(doc => doc.category === category);
    }

    const stats = {
      total: documents.length,
      byCategory: documents.reduce((acc, doc) => {
        acc[doc.category] = (acc[doc.category] || 0) + 1;
        return acc;
      }, {}),
      byStatus: documents.reduce((acc, doc) => {
        acc[doc.status] = (acc[doc.status] || 0) + 1;
        return acc;
      }, {}),
    };

    res.json({
      documents,
      stats,
      categories: ["academic", "financial", "personal", "visa", "loan", "general"],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function generateTags(docType) {
  const tagMap = {
    aadhaar: ["identity", "kyc", "government"],
    pan: ["tax", "identity", "financial"],
    passport: ["travel", "identity", "international"],
    transcript: ["academic", "grades", "university"],
    certificate: ["achievement", "academic", "recognition"],
    bank_statement: ["financial", "income", "proof"],
    cibil: ["credit", "financial", "score"],
    admit_letter: ["university", "acceptance", "offer"],
    visa: ["travel", "immigration", "permit"],
    ielts: ["english", "test", "language"],
  };
  return tagMap[docType] || ["document"];
}

function getDocumentInsights(docType) {
  const insights = {
    aadhaar: "Identity verified. Valid for KYC.",
    pan: "Tax ID verified. Required for financial transactions.",
    passport: "Travel document valid. Check expiry date.",
    transcript: "Academic record verified. GPA meets requirements.",
    cibil: "Credit score good. Eligible for loan processing.",
    admit_letter: "University acceptance confirmed. Ready for loan application.",
  };
  return insights[docType] || "Document uploaded successfully.";
}

// =====================================================
// 12. BUDGET CALCULATOR (Detailed)
// =====================================================
router.post("/budget/calculate", (req, res) => {
  try {
    const {
      tuitionFee,
      livingExpenses,
      travelCost,
      insurance,
      currency,
      exchangeRate,
      savings,
      loanAmount,
      scholarshipAmount,
    } = req.body;

    const totalEducationCost = tuitionFee + livingExpenses + travelCost + insurance;
    const totalFunding = savings + loanAmount + scholarshipAmount;
    const shortfall = Math.max(0, totalEducationCost - totalFunding);

    const monthlyBreakdown = {
      tuition: Math.round(tuitionFee / 12),
      living: Math.round(livingExpenses / 12),
      total: Math.round(totalEducationCost / 12),
    };

    const recommendations = [];
    if (shortfall > 0) {
      recommendations.push(`Need additional ₹${shortfall.toLocaleString()} funding`);
    }
    if (loanAmount > totalEducationCost * 0.7) {
      recommendations.push("High loan dependency - consider scholarships");
    }
    if (savings < totalEducationCost * 0.2) {
      recommendations.push("Build emergency fund before departure");
    }

    res.json({
      summary: {
        totalCost: totalEducationCost,
        totalFunding,
        shortfall,
        netPosition: totalFunding - totalEducationCost,
      },
      breakdown: {
        education: {
          tuition: tuitionFee,
          living: livingExpenses,
          travel: travelCost,
          insurance,
        },
        funding: {
          savings,
          loan: loanAmount,
          scholarship: scholarshipAmount,
        },
      },
      monthly: monthlyBreakdown,
      recommendations,
      currency: currency || "INR",
      exchangeRate: exchangeRate || 1,
      affordability: shortfall === 0 ? "Fully funded" : shortfall < totalEducationCost * 0.3 ? "Mostly funded" : "Significant gap",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// 13. INTERVIEW PREPARATION
// =====================================================
router.post("/interview/prepare", async (req, res) => {
  try {
    const { university, program, experience, strengths } = req.body;

    const mockQuestions = [
      {
        category: "Academic",
        questions: [
          "Why do you want to study at " + university + "?",
          "How does this program align with your career goals?",
          "What specific research interests do you have in " + program + "?",
          "How have your previous academic experiences prepared you?",
        ],
      },
      {
        category: "Personal",
        questions: [
          "Tell us about a challenge you overcame.",
          "What are your strengths and how will they help you succeed?",
          "Why did you choose this field of study?",
          "Where do you see yourself in 5 years?",
        ],
      },
      {
        category: "Program Specific",
        questions: [
          "What makes you a good fit for our " + program + " program?",
          "How will you contribute to our academic community?",
          "What research or projects are you working on?",
          "How do you plan to fund your education?",
        ],
      },
    ];

    const tips = [
      "Research the university and program thoroughly",
      "Practice speaking clearly and confidently",
      "Prepare specific examples for behavioral questions",
      "Show enthusiasm for the program and university",
      "Be honest about your background and goals",
      "Ask thoughtful questions about the program",
      "Follow up with a thank-you email within 24 hours",
    ];

    const preparationPlan = {
      timeline: [
        { week: "Week 1", tasks: ["Research university website", "Review program curriculum", "Prepare basic answers"] },
        { week: "Week 2", tasks: ["Practice mock interviews", "Refine answers", "Research current faculty"] },
        { week: "Week 3", tasks: ["Technical questions practice", "Body language practice", "Final review"] },
      ],
      resources: [
        "University website and admissions blog",
        "Program-specific research papers",
        "Alumni interview experiences",
        "Professional networking sites",
      ],
    };

    res.json({
      university,
      program,
      interviewQuestions: mockQuestions,
      preparationTips: tips,
      preparationPlan,
      estimatedDuration: "30-45 minutes",
      successRate: experience > 2 ? "85%" : "70%",
      commonMistakes: [
        "Not researching the university enough",
        "Giving generic answers",
        "Not preparing questions for interviewers",
        "Poor body language",
      ],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
