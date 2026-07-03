import { auth } from '../lib/auth.js';
import { fromNodeHeaders } from 'better-auth/node';
export const protect = async (req, res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        });
        if (!session || !session?.user) {
            return res.status(401).json({ message: 'Unauthorized user' });
        }
        req.userId = session.user.id;
        next();
    }
    catch (error) {
        console.log(error);
        res.status(401).json({ message: error.code || error.message });
    }
};
