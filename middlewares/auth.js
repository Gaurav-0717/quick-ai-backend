import { clerkClient } from "@clerk/express";

export const auth = async (req, res, next) => {
    try {
        const { userId, has } = await req.auth();
        const hasPremiumPlan = await has({ plan: 'premium' });
        const user = await clerkClient.users.getUser(userId);

        req.free_usage = hasPremiumPlan ? 0 : (user.privateMetadata?.free_usage || 0);
        if (hasPremiumPlan) {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: { 
                    free_usage: 0
                }
            });
        }
        req.plan = hasPremiumPlan ? 'premium' : 'free';
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
};

        
     