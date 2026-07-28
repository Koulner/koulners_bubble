import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Enterprise-Grade Security Whitelist Check
      const allowedUser = process.env.ALLOWED_GITHUB_USER?.toLowerCase().trim();
      const allowedEmail = process.env.ALLOWED_GITHUB_EMAIL?.toLowerCase().trim();

      // Check username from profile or email from user
      const githubUsername = (profile as any)?.login?.toLowerCase().trim();
      const userEmail = user?.email?.toLowerCase().trim();

      // In local dev without env vars set, warn
      if (!allowedUser && !allowedEmail) {
        console.warn("[SECURITY WARNING] No ALLOWED_GITHUB_USER or ALLOWED_GITHUB_EMAIL set in environment variables! Denying access.");
        return false;
      }

      const isUsernameMatch = allowedUser && githubUsername === allowedUser;
      const isEmailMatch = allowedEmail && userEmail === allowedEmail;

      if (isUsernameMatch || isEmailMatch) {
        console.log(`[AUTH SUCCESS] Access granted to whitelisted user: ${githubUsername || userEmail}`);
        return true;
      }

      console.warn(`[AUTH BLOCKED] Unauthorized login attempt by: username=${githubUsername}, email=${userEmail}`);
      return false;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
        (session.user as any).login = (token as any).login || session.user.name;
      }
      return session;
    },
    async jwt({ token, profile }) {
      if (profile) {
        (token as any).login = (profile as any).login;
      }
      return token;
    },
  },
  pages: {
    signIn: "/studio/login",
    error: "/studio/login",
  },
  secret: process.env.AUTH_SECRET || "koulners-bubble-enterprise-secret-key-32chars",
  trustHost: true,
});
