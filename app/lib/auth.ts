import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import User from "@/app/models/User";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        try {
          await dbConnect();

          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            return null;
          }

          const senhaCorreta = await user.comparePassword(credentials.password);

          if (!senhaCorreta) {
            return null;
          }

          if (!user.active) {
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Erro na autenticação:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production', // Importante para HTTPS
}; 