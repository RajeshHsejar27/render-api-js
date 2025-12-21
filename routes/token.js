// const express = require("express");
// const axios = require("axios");
// const router = express.Router();

// // Replace with your actual provider resource:
// // //iam.googleapis.com/projects/598593555902/locations/global/workloadIdentityPools/entra-id-provider/providers/entra-id-provider
// const GCP_WIF_PROVIDER_AUDIENCE = "//iam.googleapis.com/projects/598593555902/locations/global/workloadIdentityPools/entra-id-provider/providers/entra-id-provider";

// router.post("/token/exchange", async (req, res) => {
//   const incomingToken = req.body.token || req.token; // prefer body.token; fall back to Bearer
//   if (!incomingToken) {
//     return res.status(400).json({ error: "token is required in body or Authorization header" });
//   }

//   try {
//     // Token exchange via Google STS
//     const { data } = await axios.post(
//       "https://sts.googleapis.com/v1/token",
//       {
//         grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
//         subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
//         subject_token: incomingToken,
//         audience: GCP_WIF_PROVIDER_AUDIENCE
//       },
//       { headers: { "Content-Type": "application/json" }, timeout: 10000 }
//     );

//     return res.json({
//       access_token: data.access_token,
//       issued_token_type: data.issued_token_type,
//       token_type: data.token_type,
//       expires_in: data.expires_in
//     });
//   } catch (err) {
//     const detail = err.response?.data || err.message;
//     return res.status(500).json({ error: "Token exchange failed", detail });
//   }
// });

// module.exports = router;
// const express = require("express");
// const axios = require("axios");
// const qs = require("querystring");
// const jwt = require("jsonwebtoken");
// const router = express.Router();

// // const GCP_WIF_PROVIDER_AUDIENCE =
// //   "//iam.googleapis.com/projects/598593555902/locations/global/workloadIdentityPools/entra-id-provider/providers/entra-id-provider";
// const GCP_WIF_PROVIDER_AUDIENCE =
//   "//iam.googleapis.com/projects/598593555902/locations/global/workloadIdentityPools/entra-id-pool/providers/entra-id-provider";

// router.post("/token/exchange", async (req, res) => {
//   const incomingTokenRaw = req.body.token || req.token || req.headers["authorization"];
//   if (!incomingTokenRaw) {
//     return res.status(400).json({ error: "token is required in body or Authorization header" });
//   }

//   // normalize token: accept "Bearer <token>" or raw token
//   let incomingToken = incomingTokenRaw;
//   if (typeof incomingToken === "string" && incomingToken.startsWith("Bearer ")) {
//     incomingToken = incomingToken.slice("Bearer ".length);
//   }

//   try {
//     // debug: decode claims
//     try {
//       const claims = jwt.decode(incomingToken);
//       console.log("Decoded incoming token claims:", {
//         iss: claims?.iss,
//         aud: claims?.aud,
//         sub: claims?.sub,
//         exp: claims?.exp
//       });
//     } catch (decodeErr) {
//       console.warn("Failed to decode incoming token for inspection:", decodeErr.message);
//     }

//     // build form payload
//     const stsPayload = {
//       grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
//       subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
//       subject_token: incomingToken,
//       audience: GCP_WIF_PROVIDER_AUDIENCE
//     };

//     console.log("STS request payload (before POST):", {
//       grant_type: stsPayload.grant_type,
//       subject_token_type: stsPayload.subject_token_type,
//       audience: stsPayload.audience,
//       subject_token_length: stsPayload.subject_token?.length || 0
//     });

//     const formBody = qs.stringify(stsPayload);

//     const { data } = await axios.post(
//       "https://sts.googleapis.com/v1/token",
//       formBody,
//       {
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         timeout: 10000
//       }
//     );

//     return res.json({
//       access_token: data.access_token,
//       issued_token_type: data.issued_token_type,
//       token_type: data.token_type,
//       expires_in: data.expires_in
//     });
//   } catch (err) {
//     console.error("Token exchange error:", {
//       message: err.message,
//       responseStatus: err.response?.status,
//       responseHeaders: err.response?.headers,
//       responseData: err.response?.data
//     });

//     const detail = err.response?.data || err.message;
//     return res.status(500).json({ error: "Token exchange failed", detail });
//   }
// });

// module.exports = router;



const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const router = express.Router();

const GCP_WIF_PROVIDER_AUDIENCE =
  "//iam.googleapis.com/projects/598593555902/locations/global/workloadIdentityPools/entra-id-pool/providers/entra-id-provider";

router.post("/token/exchange", async (req, res) => {
  const incomingTokenRaw = req.body.token || req.token || req.headers["authorization"];
  if (!incomingTokenRaw) {
    return res.status(400).json({ error: "token is required in body or Authorization header" });
  }

  // normalize token: accept "Bearer <token>" or raw token
  let incomingToken = incomingTokenRaw;
  if (typeof incomingToken === "string" && incomingToken.startsWith("Bearer ")) {
    incomingToken = incomingToken.slice("Bearer ".length);
  }

  try {
    // optional debug
    const claims = jwt.decode(incomingToken);
    console.log("Decoded incoming token claims:", {
      iss: claims?.iss,
      aud: claims?.aud,
      sub: claims?.sub,
      exp: claims?.exp
    });

    // build form payload with URLSearchParams
    const params = new URLSearchParams();
    params.append("grant_type", "urn:ietf:params:oauth:grant-type:token-exchange");
    params.append("subject_token_type", "urn:ietf:params:oauth:token-type:jwt");
    params.append("subject_token", incomingToken);
    params.append("audience", GCP_WIF_PROVIDER_AUDIENCE);

    console.log("STS request payload (before POST):", {
      grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      audience: GCP_WIF_PROVIDER_AUDIENCE,
      subject_token_length: incomingToken.length
    });

    const { data } = await axios.post(
      "https://sts.googleapis.com/v1/token",
      params.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
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
    console.error("Token exchange error:", {
      message: err.message,
      responseStatus: err.response?.status,
      responseHeaders: err.response?.headers,
      responseData: err.response?.data
    });

    const detail = err.response?.data || err.message;
    return res.status(500).json({ error: "Token exchange failed", detail });
  }
});

module.exports = router;



