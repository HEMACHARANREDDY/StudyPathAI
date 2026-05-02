const https = require("https");
const http = require("http");
const { URL } = require("url");

function postJson(urlString, body, headers = {}, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const client = url.protocol === "https:" ? https : http;
    const payload = JSON.stringify(body);

    const req = client.request(
      {
        method: "POST",
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
          ...headers,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const parsed = data ? JSON.parse(data) : {};
            resolve({ statusCode: res.statusCode || 0, data: parsed });
          } catch (error) {
            reject(new Error("Invalid JSON response from bureau API"));
          }
        });
      }
    );

    req.on("error", reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error("Bureau API request timed out"));
    });
    req.write(payload);
    req.end();
  });
}

function generateDemoCibilScore({ pan, aadhaar, dob, annualIncome, currentAddress }) {
  const base = 63;
  const panBonus = String(pan || "").toUpperCase().includes("A") ? 7 : 3;
  const aadhaarBonus = String(aadhaar || "").replace(/\D/g, "").endsWith("0") ? 4 : 2;
  const incomeBonus = Math.min(10, Math.floor((parseFloat(annualIncome) || 0) / 150000));
  const addressBonus = String(currentAddress || "").trim().length > 20 ? 5 : 2;
  const dobBonus = dob ? 3 : 0;
  return Math.max(0, Math.min(100, base + panBonus + aadhaarBonus + incomeBonus + addressBonus + dobBonus));
}

function normalizeBureauScore(score) {
  const numeric = parseFloat(score);
  if (Number.isNaN(numeric)) {
    return NaN;
  }

  // If the bureau returns the traditional 300-900 range, convert it to 0-100 for this app.
  if (numeric > 100) {
    return Math.max(0, Math.min(100, Math.round(((numeric - 300) / 600) * 100)));
  }

  return Math.max(0, Math.min(100, Math.round(numeric)));
}

async function getBureauCibilScore(kycInput) {
  const bureauUrl = process.env.BUREAU_API_URL;
  const bureauApiKey = process.env.BUREAU_API_KEY;
  const bureauMode = (process.env.BUREAU_MODE || "demo").toLowerCase();
  const enteredScore = parseFloat(kycInput.enteredScore);

  if (!bureauUrl || bureauMode === "demo") {
    const demoScore = Number.isNaN(enteredScore) ? generateDemoCibilScore(kycInput) : enteredScore;
    return {
      score: demoScore,
      normalizedScore: demoScore,
      source: "demo",
      matched: true,
      note: "Demo bureau scoring used because bureau credentials are not configured.",
    };
  }

  const response = await postJson(
    bureauUrl,
    {
      pan: kycInput.pan,
      aadhaar: kycInput.aadhaar,
      dob: kycInput.dob,
      name: kycInput.applicantName,
      address: kycInput.currentAddress,
      income: kycInput.annualIncome,
      enteredScore: kycInput.enteredScore,
    },
    bureauApiKey ? { Authorization: `Bearer ${bureauApiKey}` } : {}
  );

  const body = response.data || {};
  const rawScore = parseFloat(
    body.cibilScore ?? body.score ?? body.bureauScore ?? body.creditScore
  );

  if (Number.isNaN(rawScore)) {
    throw new Error("Bureau API response did not include a valid CIBIL score");
  }

  const normalizedScore = normalizeBureauScore(rawScore);

  return {
    score: normalizedScore,
    rawScore,
    normalizedScore,
    source: body.source || "bureau",
    matched: true,
    referenceId: body.referenceId || body.requestId || null,
    raw: body,
  };
}

module.exports = {
  getBureauCibilScore,
  generateDemoCibilScore,
};