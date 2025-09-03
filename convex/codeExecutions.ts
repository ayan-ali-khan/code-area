import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";


export const savedExecution = mutation({
    args: {
        language: v.string(),
        code: v.string(),
        //we will have either one of them at a time
        output: v.optional(v.string()),
        error: v.optional(v.string()),
    },
    handler: async(ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        if(!identity){
            throw new ConvexError("Not authenticated")
        }

        const user = await ctx.db
        .query("users")
        .withIndex("by_user_id")
        .filter((q) => q.eq(q.field("userId"), identity.subject))
        .first();

        if(!user?.isPro && ["typecript", "csharp", "go", "rust", "java", "swift", "ruby"].includes(args.language)){
            throw new ConvexError("Pro subscription required to use this language")
        }

        await ctx.db.insert("codeExections", {
            ...args,
            userId: identity.subject
        })
    }
})