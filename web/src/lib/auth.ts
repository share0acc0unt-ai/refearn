import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}

export function signJwt(payload: object) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export interface CustomJwtPayload extends JwtPayload {
    userId?: string;
}

export function verifyJwt(token: string): CustomJwtPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return typeof decoded === 'string' ? null : (decoded as CustomJwtPayload);
    } catch (error) {
        return null;
    }
}
