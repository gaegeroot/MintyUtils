import {
    AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET,
    AUTH0_DOMAIN,
    COOKIE_NAME,
    JWKS_URL,
    SESSION_SECRET,
} from "$env/static/private";
import { PUBLIC_BASE_URL } from "$env/static/public";
import jwt from "jsonwebtoken";
import * as jose from 'jose';

let cachedKey = undefined;

const COOKIE_DURATION_SECONDS = 60 * 60 * 24 * 7; // 1 week

// function getKey(header, callback) {
//     const client = new JwksClient({ jwksUri: JWKS_URL });

//     client.getSigningKey(header.kid, (err, key) => {
//         if (err) {
//             callback(err);
//             return;
//         }

//         if (cachedKey) {
//             callback(null, cachedKey);
//             return;
//         }

//         const signingKey = key?.getPublicKey();
//         cachedKey = signingKey;
//         callback(null, signingKey);
//     });
// }

export async function verifyToken(token) {
    const JWKS = jose.createRemoteJWKSet(
        new URL(`https://${AUTH0_DOMAIN}/.well-known/jwks.json`)
    );

    const { payload } = await jose.jwtVerify(token, JWKS, {
        issuer: `https://${AUTH0_DOMAIN}/`,
        audience: AUTH0_CLIENT_ID,
    });

    return payload;
}

export async function getToken({ code }) {
    const resp = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
        method: "POST",
        body: JSON.stringify({
            code,
            client_id: AUTH0_CLIENT_ID,
            client_secret: AUTH0_CLIENT_SECRET,
            redirect_uri: `${PUBLIC_BASE_URL}/api/auth/callback`,
            grant_type: "authorization_code",
        }),
        headers: {
            "Content-Type": "application/json",
        },
    });

    return await resp.json();
}

export const getAuthUser = (cookies) => {
    const jwtToken = cookies.get(COOKIE_NAME);
    if (!jwtToken) return null;

    return jwt.decode(jwtToken);
};

export const setAuthCookie = (cookies, user) => {
    const cookieValue = jwt.sign(user, SESSION_SECRET);

    cookies.set(COOKIE_NAME, cookieValue, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: COOKIE_DURATION_SECONDS,
        path: "/",
    });
};
