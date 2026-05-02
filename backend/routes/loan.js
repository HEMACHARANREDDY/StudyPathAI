const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const { getBureauCibilScore } = require("../services/bureau");
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const applications = [];
const kycRecords = [];
const verifiedPhones = new Map(); // phone -> { verified: true, at: ISO }
const pendingOtps = new Map(); // phone -> { code, expires }

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const AADHAAR_REGEX = /^[0-9]{12}$/;
const E164_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;
const REQUIRED_KYC_DOCS = ["aadhaar", "pan", "photo", "cibil"];
const MAX_DOC_SIZE = 5 * 1024 * 1024;

function detectDocCategory(doc = {}) {
  // Prefer explicit category sent by frontend KYC slots.
  const explicit = String(doc.category || "").toLowerCase().trim();
  if (["aadhaar", "pan", "photo", "cibil"].includes(explicit)) return explicit;

  const text = `${doc.name || ""} ${doc.type || ""}`.toLowerCase();
  if (text.includes("aadhaar") || text.includes("aadhar")) return "aadhaar";
  if (text.includes("pan")) return "pan";
  if (text.includes("cibil") || text.includes("credit")) return "cibil";
  if (text.includes("photo") || text.includes("selfie") || text.includes("signature")) return "photo";
  return "unknown";
}

function isValidTwilioValue(value) {
  if (!value) return false;
  const raw = String(value).trim();
  if (!raw) return false;
  return !raw.includes("your_twilio");
}

function normalizePhoneNumber(phoneNumber = "") {
  const raw = String(phoneNumber || "").trim();
  if (!raw) return null;

  // Already in international format.
  if (raw.startsWith("+") && E164_PHONE_REGEX.test(raw)) {
    return raw;
  }

  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  if (digits.length >= 8 && digits.length <= 15) {
    return `+${digits}`;
  }

  return null;
}

function maskPhoneNumber(phoneNumber = "") {
  const normalized = normalizePhoneNumber(phoneNumber);
  if (!normalized) return "invalid";
  const suffix = normalized.slice(-4);
  return `${normalized.slice(0, 3)}XXXXXX${suffix}`;
}

async function verifyPhoneWithTwilio(phoneNumber) {
  const normalized = normalizePhoneNumber(phoneNumber);
  if (!normalized) {
    return {
      source: "local",
      valid: false,
      isRealCustomer: false,
      message: "Invalid phone number format.",
      phoneNumber: null,
      lineType: null,
    };
  }

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  if (!twilioSid || !twilioToken) {
    return {
      source: "local-format-check",
      valid: true,
      isRealCustomer: null,
      message: "Phone format is valid. Twilio lookup not configured yet.",
      phoneNumber: normalized,
      lineType: null,
    };
  }

  const lookupUrl = `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(normalized)}?Fields=line_type_intelligence`;
  const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");

  try {
    const response = await fetch(lookupUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        source: "twilio",
        valid: false,
        isRealCustomer: false,
        message: `Twilio lookup failed (${response.status}). ${errorText || ""}`.trim(),
        phoneNumber: normalized,
        lineType: null,
      };
    }

    const data = await response.json();
    const lineType = data?.line_type_intelligence?.type || null;
    const valid = !!data?.valid;
    const isRealCustomer = valid && lineType !== "voip" && lineType !== "nonFixedVoip";

    return {
      source: "twilio",
      valid,
      isRealCustomer,
      message: valid
        ? `Phone verified via Twilio (${lineType || "unknown line type"}).`
        : "Twilio could not validate this phone number.",
      phoneNumber: data?.phone_number || normalized,
      lineType,
      countryCode: data?.country_code || null,
    };
  } catch (error) {
    return {
      source: "twilio",
      valid: false,
      isRealCustomer: false,
      message: `Twilio lookup error: ${error.message}`,
      phoneNumber: normalized,
      lineType: null,
    };
  }
}

router.post("/process-admit", async (req, res) => {
  try {
    const { studentProfile } = req.body;
    const { budget } = studentProfile;

    const loanAmount = Math.round((parseFloat(budget) || 60) * 0.85);
    const emiMonthly = Math.round((loanAmount * 100000 * 0.095 / 12) / (1 - Math.pow(1 + 0.095 / 12, -120)));

    const loanOffer = {
      approved: true,
      amount: `${loanAmount}L`,
      amountNum: loanAmount,
      interestRate: "9.5%",
      tenure: "10 years",
      emi: "₹" + emiMonthly.toLocaleString("en-IN"),
      processingTime: "3 business days",
      features: [
        "No collateral required up to ₹40L",
        "Moratorium period during study",
        "Tax benefit under Section 80E",
        "Doorstep document collection",
      ],
      preApprovalCode: "PF" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    };

    res.json({ loanOffer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/eligibility", async (req, res) => {
  try {
    const { gpa, budget } = req.body;
    const eligible = parseFloat(gpa) >= 6.0;
    res.json({ eligible, maxAmount: `₹${Math.round((parseFloat(budget) || 60) * 0.85)}L`, rate: "9.5%" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/kyc/submit", async (req, res) => {
  try {
    const {
      applicantName,
      email,
      pan,
      aadhaar,
      phoneNumber,
      dob,
      cibilScore,
      annualIncome,
      currentAddress,
      documents,
    } = req.body;

    if (!applicantName || String(applicantName).trim().length < 2) {
      return res.status(400).json({ error: "Applicant name is required for KYC." });
    }

    const normalizedPan = String(pan || "").trim().toUpperCase();
    if (!PAN_REGEX.test(normalizedPan)) {
      return res.status(400).json({ error: "Invalid PAN format. Use format like ABCDE1234F." });
    }

    const normalizedAadhaar = String(aadhaar || "").replace(/\D/g, "");
    if (!AADHAAR_REGEX.test(normalizedAadhaar)) {
      return res.status(400).json({ error: "Invalid Aadhaar number. Enter 12 digits." });
    }

    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
    if (!normalizedPhoneNumber) {
      return res.status(400).json({ error: "Invalid phone number. Use 10 digits or international format." });
    }

    if (!dob) {
      return res.status(400).json({ error: "Date of birth is required." });
    }

    const parsedDob = new Date(dob);
    if (Number.isNaN(parsedDob.getTime())) {
      return res.status(400).json({ error: "Invalid date of birth." });
    }

    const age = Math.floor((Date.now() - parsedDob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 18) {
      return res.status(400).json({ error: "Applicant must be at least 18 years old." });
    }

    const parsedCibil = parseFloat(cibilScore);
    if (Number.isNaN(parsedCibil)) {
      return res.status(400).json({ error: "CIBIL score is required." });
    }

    const income = parseFloat(annualIncome);
    if (Number.isNaN(income) || income <= 0) {
      return res.status(400).json({ error: "Annual income must be greater than 0." });
    }

    if (!currentAddress || String(currentAddress).trim().length < 10) {
      return res.status(400).json({ error: "Please provide a complete current address." });
    }

    if (!Array.isArray(documents) || documents.length < REQUIRED_KYC_DOCS.length) {
      return res.status(400).json({ error: "Upload Aadhaar, PAN, photo with date/signature, and CIBIL screenshot." });
    }

    const categorizedDocs = documents.map((doc) => ({
      ...doc,
      category: detectDocCategory(doc),
    }));

    const missingDocs = REQUIRED_KYC_DOCS.filter(
      (required) => !categorizedDocs.some((doc) => doc.category === required)
    );

    if (missingDocs.length > 0) {
      return res.status(400).json({
        error: `Missing required KYC document(s): ${missingDocs.join(", ")}`,
      });
    }

    const oversized = categorizedDocs.find((doc) => parseFloat(doc.size) > MAX_DOC_SIZE);
    if (oversized) {
      return res.status(400).json({
        error: `KYC file too large: ${oversized.name}. Max 5MB each.`,
      });
    }

    const bureauResult = await getBureauCibilScore({
      applicantName,
      pan: normalizedPan,
      aadhaar: normalizedAadhaar,
      dob,
      annualIncome: income,
      currentAddress,
      enteredScore: parsedCibil,
    });

    const phoneVerification = await verifyPhoneWithTwilio(normalizedPhoneNumber);
    if (!phoneVerification.valid) {
      return res.status(400).json({
        error: "Phone number validation failed. Please use a real active number.",
        phoneVerification,
      });
    }

    const bureauScore = parseFloat(bureauResult.normalizedScore ?? bureauResult.score);
    const bureauRawScore = parseFloat(bureauResult.rawScore ?? bureauScore);
    const scoreDifference = Math.abs(bureauScore - parsedCibil);

    if (bureauScore <= 60) {
      return res.status(400).json({
        error: "Bureau CIBIL score is not eligible for loan approval.",
        bureauScore,
        bureauRawScore,
        enteredScore: parsedCibil,
      });
    }

    if (scoreDifference > 5) {
      return res.status(400).json({
        error: "Entered CIBIL score does not match bureau score.",
        bureauScore,
        bureauRawScore,
        enteredScore: parsedCibil,
      });
    }

    const now = new Date().toISOString();
    const kycId = `KYC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const kyc = {
      kycId,
      status: "verified",
      verified: true,
      verifiedAt: now,
      applicantName: applicantName.trim(),
      email: email || "not-provided",
      panMasked: `${normalizedPan.slice(0, 5)}XXXX${normalizedPan.slice(-1)}`,
      aadhaarMasked: `XXXXXXXX${normalizedAadhaar.slice(-4)}`,
      phoneMasked: maskPhoneNumber(normalizedPhoneNumber),
      phoneVerification,
      dob,
      age,
      cibilScore: parsedCibil,
      bureauCibilScore: bureauScore,
      bureauRawScore,
      bureauSource: bureauResult.source,
      bureauReferenceId: bureauResult.referenceId || null,
      annualIncome: income,
      currentAddress: String(currentAddress).trim(),
      verificationChecks: {
        panValidated: true,
        aadhaarValidated: true,
        ageValidated: true,
        currentAddressValidated: true,
        cibilValidated: parsedCibil > 60,
        bureauCibilValidated: bureauScore > 60,
        scoreMatched: scoreDifference <= 5,
        phoneValidated: phoneVerification.valid,
        phoneRealCustomer: phoneVerification.isRealCustomer,
        documentsValidated: true,
      },
      documents: categorizedDocs.map((doc) => ({
        name: doc.name,
        type: doc.type,
        size: doc.size,
        category: doc.category,
      })),
    };

    kycRecords.push(kyc);
    return res.json({ success: true, message: "KYC verified successfully.", kyc });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/apply", async (req, res) => {
  try {
    const { applicantName, email, loanOffer, targetCountry, documentName, kycId } = req.body;

    if (!loanOffer || !loanOffer.preApprovalCode) {
      return res.status(400).json({
        error: "Valid loan offer with pre-approval code is required before application.",
      });
    }

    if (!applicantName || String(applicantName).trim().length < 2) {
      return res.status(400).json({ error: "Applicant name is required." });
    }

    if (!kycId) {
      return res.status(400).json({ error: "KYC verification required before applying." });
    }

    const kycRecord = kycRecords.find((item) => item.kycId === kycId);
    if (!kycRecord || !kycRecord.verified) {
      return res.status(400).json({ error: "KYC not verified. Please complete KYC and retry." });
    }

    if (parseFloat(kycRecord.cibilScore) <= 60) {
      return res.status(400).json({ error: "Loan cannot be approved. CIBIL score must be greater than 60." });
    }

    if (parseFloat(kycRecord.bureauCibilScore || 0) <= 60) {
      return res.status(400).json({ error: "Loan cannot be approved. Bureau CIBIL score must be greater than 60." });
    }

    if (!kycRecord.verificationChecks?.scoreMatched) {
      return res.status(400).json({ error: "Loan cannot be approved. Entered score and bureau score do not match." });
    }

    if (!kycRecord.verificationChecks?.phoneValidated) {
      return res.status(400).json({ error: "Loan cannot be approved. Phone number verification is required." });
    }

    const submittedAt = new Date().toISOString();
    const applicationId = `PF-APP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const application = {
      applicationId,
      status: "submitted",
      applicantName,
      email: email || "not-provided",
      targetCountry: targetCountry || "not-provided",
      documentName: documentName || "not-provided",
      submittedAt,
      preApprovalCode: loanOffer.preApprovalCode,
      kycId,
      kycStatus: kycRecord.status,
      cibilScore: kycRecord.cibilScore,
      bureauCibilScore: kycRecord.bureauCibilScore,
      bureauRawScore: kycRecord.bureauRawScore,
      bureauSource: kycRecord.bureauSource,
      currentAddress: kycRecord.currentAddress,
      approvedAmount: loanOffer.amount,
      interestRate: loanOffer.interestRate,
      tenure: loanOffer.tenure,
      emi: loanOffer.emi,
      nextSteps: [
        "Relationship manager will contact you within 24 hours",
        "Upload KYC and income documents",
        "Final verification and disbursal",
      ],
    };

    applications.push(application);

    return res.json({
      success: true,
      message: "Application submitted successfully.",
      application,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// OTP endpoints (Twilio Verify or in-memory fallback)
router.post('/phone/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone is required' });

    const normalized = normalizePhoneNumber(phone);
    if (!normalized) return res.status(400).json({ error: 'Invalid phone format' });

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;
    const canUseSms = isValidTwilioValue(accountSid) && isValidTwilioValue(authToken) && isValidTwilioValue(fromNumber);

    if (!canUseSms) {
      return res.status(500).json({
        error: 'Twilio SMS is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER in backend/.env.',
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000;
    pendingOtps.set(normalized, { code, expires });

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const body = new URLSearchParams({
      To: normalized,
      From: fromNumber,
      Body: `Your StudyPath OTP is ${code}. It expires in 5 minutes.`,
    }).toString();
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const r = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const data = await r.json().catch(async () => ({ message: await r.text() }));
    if (r.ok) {
      return res.json({ success: true, source: 'twilio-sms', to: normalized, data });
    }

    pendingOtps.delete(normalized);
    return res.status(500).json({ error: 'Twilio SMS failed', detail: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/phone/verify-otp', async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ error: 'phone and code required' });
    const normalized = normalizePhoneNumber(phone);
    if (!normalized) return res.status(400).json({ error: 'Invalid phone format' });

    const row = pendingOtps.get(normalized);
    if (!row) return res.status(400).json({ error: 'No pending OTP' });
    if (Date.now() > row.expires) {
      pendingOtps.delete(normalized);
      return res.status(400).json({ error: 'OTP expired' });
    }
    if (String(row.code) !== String(code)) return res.status(400).json({ error: 'Invalid OTP' });

    pendingOtps.delete(normalized);
    verifiedPhones.set(normalized, { verified: true, at: new Date().toISOString() });
    return res.json({ success: true, source: 'local' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
