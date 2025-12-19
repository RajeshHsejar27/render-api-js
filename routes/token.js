const express = require("express");
const axios = require("axios");
const router = express.Router();

// Replace with your actual provider resource string
// Format: //iam.googleapis.com/projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/<POOL_ID>/providers/<PROVIDER_ID>
const GCP_WIF_PROVIDER_AUDIENCE =
  "//iam.googleapis.com/projects/598593555902/locations/global/workloadIdentityPools/entra-id-provider/providers/entra-id-provider";

router.post("/token/exchange", async (req, res) => {
  const incomingToken = req.body.token || req.token; // prefer body.token; fall back to Bearer
  if (!incomingToken) {
    return res
      .status(400)
      .json({ error: "token is required in body or Authorization header" });
  }

  try {
    // Token exchange via Google STS
    const { data } = await axios.post(
      "https://sts.googleapis.com/v1/token",
      {
        grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
        subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
        subject_token: incomingToken,
        audience: GCP_WIF_PROVIDER_AUDIENCE
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000
      }
    );

    return res.json({
      access_token: data.access_token,
      issued_token_type: data.issued_token_type,
      token_type: data.token_type,
      expires_in: data.expires_in
    });
  } catch (err) {
    const detail = err.response?.data || err.message;
    return res.status(500).json({ error: "Token exchange failed", detail });
  }
});

module.exports = router;
