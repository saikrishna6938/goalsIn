"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = exports.generateJWTSecretKey = exports.signJWT = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const crypto = __importStar(require("crypto"));
const privateKey = `
-----BEGIN RSA PRIVATE KEY-----
MIICWwIBAAKBgHgnvr7O2tiApjJfid1orFnIGm6980fZp+Lpbjo+NC/0whMFga2B
iw5b1G2Q/B2u0tpO1Fs/E8z7Lv1nYfr5jx2S8x6BdA4TS2kB9Kf0wn0+7wSlyikH
oKhbtzwXHZl17GsyEi6wHnsqNBSauyIWhpha8i+Y+3GyaOY536H47qyXAgMBAAEC
gYAOphnVPXbk6lpYzdkLC1Xn5EOEuNfOLLURLxBnPWozZo26r/Mtahu/9mYhrYlv
PP8r6mxta3VIil8iOdZyOLa/4d1LPd+UehgEXIJEiYXLtn7RS5eUnoPuQxssfs1k
OWjdN8p6SzppleegFTvGRX4KM3cDLfSphOk8JuBCrpSSYQJBAOdqizTSrdKMTuVe
c7Jk1JOJkyFuFs+N5zeryyeFGH7IpRdWy0rkWMxIUAi8Ap1vYVBPHv4tDOo3sy5X
VLc/knkCQQCE62pg+0TmsrhO/2Pgog6MLBkzlzXYMRp/01HbmznwYF+ejfPnzLkz
hnUlxRUNK3lhXM/7H6oAjvqF2R72u/OPAkEAterkmdbQfEZ+MwNoEiH/lie9OLdx
SSI1VGdBYcTYN7qFRW6eizYstBJYkDU0HQ0Uw+we4hMKJwk4W0KdvxxDiQJAeqlB
V1QqBneBbK10PzVuFV8QtrJhJyxRVwrtbKq38iMNuqUnI4+ijXEUpJFWVvv6nKXo
7McQvEk12dU/JNTX8wJAOlAtSNjp9tVwpMpC0w2St1eKc1L2SknjeohA5ldoBz8s
GeZsPhTU3eHSD1neAZXLKN5K68z3zFBr20ubY9nyLw==
-----END RSA PRIVATE KEY-----`;
const publicKey = `-----BEGIN PUBLIC KEY-----
MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgHgnvr7O2tiApjJfid1orFnIGm69
80fZp+Lpbjo+NC/0whMFga2Biw5b1G2Q/B2u0tpO1Fs/E8z7Lv1nYfr5jx2S8x6B
dA4TS2kB9Kf0wn0+7wSlyikHoKhbtzwXHZl17GsyEi6wHnsqNBSauyIWhpha8i+Y
+3GyaOY536H47qyXAgMBAAE=
-----END PUBLIC KEY-----`;
// sign jwt
function signJWT(payload, expiresIn) {
    return jwt.sign(payload, privateKey, { algorithm: "RS256", expiresIn });
}
exports.signJWT = signJWT;
function generateJWTSecretKey(length) {
    const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?/";
    let secretKey = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, alphabet.length);
        secretKey += alphabet.charAt(randomIndex);
    }
    return secretKey;
}
exports.generateJWTSecretKey = generateJWTSecretKey;
// verify jwt
function verifyJWT(token) {
    try {
        const decoded = jwt.verify(token, publicKey);
        return { payload: decoded, expired: false };
    }
    catch (err) {
        //@ts-ignore
        return { payload: null, expired: err.message.includes("jwt expired") };
    }
}
exports.verifyJWT = verifyJWT;
//# sourceMappingURL=jwt.utils.js.map