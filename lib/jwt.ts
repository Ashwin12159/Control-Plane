import jwt from "jsonwebtoken";

export function generateJWTToken(region: string, payload: any, expiresIn?: string) {
    const envName = `JWT_SECRET_${region.toUpperCase().replace(/-/g, "_")}`;
    console.log("envName", envName);
    if(!process.env[envName]) {
        throw new Error(`JWT_SECRET for region ${region} is not set`);
    }
    if(!expiresIn) {    // default to 300 seconds
        expiresIn = "300";
    } 
    return jwt.sign(payload, process.env[envName], { expiresIn: parseInt(expiresIn) });
}

export function verifyJWTToken(region: string, token: string) {
    const envName = `JWT_SECRET_${region.toUpperCase().replace(/-/g, "_")}`;
    if(!process.env[envName]) {
        throw new Error(`JWT_SECRET for region ${region} is not set`);
    }
    return jwt.verify(token, process.env[envName]);
}