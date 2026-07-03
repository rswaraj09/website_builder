import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({

    baseURL: import.meta.env.VITE_BASEURL,
    fetchOptions: { 
        credentials: 'include',
        onRequest: (ctx) => {
            if (ctx.url && ctx.url.toString().includes('/sign-up/email') && typeof ctx.body === 'string') {
                try {
                    const parsed = JSON.parse(ctx.body);
                    if (parsed.email && !parsed.name) {
                        parsed.name = parsed.email.split('@')[0];
                        ctx.body = JSON.stringify(parsed);
                    }
                } catch (e) {
                    // Do nothing
                }
            }
        }
    },
})

export const { signIn, signUp, useSession } = authClient;
