import prisma from '../lib/prisma.js';
import openai from '../config/ai.js';
export const makeRevision = async (req, res) => {
    const userId = req.userId;
    try {
        const { projectId } = req.params;
        const { message } = req.body;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!message || message.trim() === '') {
            return res.status(400).json({ message: 'Please enter a valid prompt' });
        }
        const currentProject = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId },
            include: { versions: true }
        });
        if (!currentProject) {
            return res.status(400).json({ message: 'Please enter a valid prompt' });
        }
        await prisma.conversation.create({
            data: {
                role: 'user',
                content: message,
                projectId
            }
        });
        const promptEnhanceResponse = await openai.chat.completions.create({
            model: process.env.AI_MODEL,
            messages: [
                {
                    role: 'system',
                    content: `You are a prompt enhancement specialist. The user wants to make changes to their website. Enhance their request to be more specific and actionable for a web developer.

            Enhance this by:
            1. Being specific about what elements to change
            2. Mentioning design details (colors, spacing, sizes)
            3. Clarifying the desired outcome
            4. Using clear technical terms

        Return ONLY the enhanced request, nothing else. Keep it concise (1-2 sentences).
`
                },
                {
                    role: 'user',
                    content: `User's request: "${message}"`
                }
            ]
        });
        const enhancedPrompt = promptEnhanceResponse.choices[0].message.content;
        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: `I've enhanced your prompt to: "${enhancedPrompt}"`,
                projectId
            }
        });
        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: 'Now making changes to your website...',
                projectId
            }
        });
        const codeGenerationResponse = await openai.chat.completions.create({
            model: process.env.AI_MODEL,
            messages: [
                {
                    role: 'system',
                    content: `You are an expert web developer. 

          CRITICAL REQUIREMENTS:
          - Return ONLY the complete updated HTML code with the requested changes.
          - Use Tailwind CSS for ALL styling (NO custom CSS).
          - Use Tailwind utility classes for all styling changes.
          - Include all JavaScript in <script> tags before closing </body>
          - Make sure it's a complete, standalone HTML document with Tailwind CSS
          - Return the HTML Code Only, nothing else

          Apply the requested changes while maintaining the Tailwind CSS styling approach.
      `
                }, {
                    role: 'user',
                    content: `Here is the current code :"${currentProject.current_code}" The user wants this change:"${enhancedPrompt}"`
                }
            ]
        });
        const code = codeGenerationResponse.choices[0].message.content || '';
        if (!code) {
            await prisma.conversation.create({
                data: {
                    role: 'assistant',
                    content: "Unable to generate the code please try again",
                    projectId
                }
            });
            return;
        }
        const version = await prisma.version.create({
            data: {
                code: code.replace(/```[a-z]*\n?/gi, '')
                    .replace(/```$/g, '')
                    .trim(),
                description: 'changes made',
                projectId
            }
        });
        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "I've made the changes to your website! You can now preview it",
                projectId
            }
        });
        await prisma.websiteProject.update({
            where: { id: projectId },
            data: {
                current_code: code.replace(/```[a-z]*\n?/gi, '')
                    .replace(/```$/g, '')
                    .trim(),
                current_version_index: version.id
            }
        });
        res.json({ message: 'Changes made successfully' });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message });
    }
};
export const rollbackToVersion = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { projectId, versionId } = req.params;
        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId },
            include: { versions: true }
        });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const version = project.versions.find((version) => version.id === versionId);
        if (!version) {
            return res.status(404).json({ message: 'Version not found' });
        }
        await prisma.websiteProject.update({
            where: { id: projectId, userId },
            data: {
                current_code: version.code,
                current_version_index: version.id
            }
        });
        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "I've rolled back your website to selected version. You can now preview it",
                projectId
            }
        });
        res.json({ message: 'Version rolled back' });
    }
    catch (error) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
};
export const deleteProject = async (req, res) => {
    try {
        const userId = req.userId;
        const { projectId } = req.params;
        await prisma.websiteProject.delete({
            where: { id: projectId, userId },
        });
        res.json({ message: 'Project deleted successfully' });
    }
    catch (error) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
};
export const getProjectPreview = async (req, res) => {
    try {
        const userId = req.userId;
        const { projectId } = req.params;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const project = await prisma.websiteProject.findFirst({
            where: { id: projectId, userId },
            include: { versions: true }
        });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json({ project });
    }
    catch (error) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
};
export const getPublishedProjects = async (req, res) => {
    try {
        const projects = await prisma.websiteProject.findMany({
            where: { isPublished: true },
            include: { user: true }
        });
        res.json({ projects });
    }
    catch (error) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
};
export const getProjectById = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await prisma.websiteProject.findFirst({
            where: { id: projectId },
        });
        if (!project || project.isPublished === false || !project?.current_code) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json({ code: project.current_code });
    }
    catch (error) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
};
export const saveProjectCode = async (req, res) => {
    try {
        const userId = req.userId;
        const { projectId } = req.params;
        const { code } = req.body;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!code) {
            return res.status(400).json({ message: 'Code is required' });
        }
        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId }
        });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        await prisma.websiteProject.update({
            where: { id: projectId },
            data: { current_code: code, current_version_index: '' }
        });
        res.json({ message: 'Project saved successfully' });
    }
    catch (error) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
};
