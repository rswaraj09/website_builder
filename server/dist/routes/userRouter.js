import express from 'express';
import { createUserProject, getUserProject, getUserProjects, togglePublish } from '../controller/userController.js';
import { protect } from '../middlewares/auth.js';
const userRouter = express.Router();
userRouter.post('/project', protect, createUserProject);
userRouter.get('/project/:projectId', protect, getUserProject);
userRouter.get('/projects', protect, getUserProjects);
userRouter.get('/publish-toggle/:projectId', protect, togglePublish);
export default userRouter;
