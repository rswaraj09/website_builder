import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import userRouter from './routes/userRouter.js';
import projectRouter from './routes/projectRoutes.js';
const app = express();
const port = process.env.PORT || 3000;
const corsOptions = {
    origin: process.env.TRUSTED_ORIGINS?.split(',') || [],
    credentials: true,
};
app.use(cors(corsOptions));
// mount the Better Auth handler at /api/auth so all subpaths (e.g. /api/auth/delete-user)
// are handled by the auth middleware
app.use('/api/auth', toNodeHandler(auth));
app.use(express.json({ limit: '50mb' }));
app.get('/', (req, res) => {
    res.send('Server is Live!');
});
app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}
export default app;
