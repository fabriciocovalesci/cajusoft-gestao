import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Lista de usuários mock
const users = [
  {
    id: "1",
    name: "Administrador",
    email: "admin@pacajus.ce.gov.br",
    password: "123456"
  },
  {
    id: "2",
    name: "Usuário Teste",
    email: "teste@pacajus.ce.gov.br",
    password: "123456"
  }
];

const handler = NextAuth({
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Credenciais inválidas');
        }

        try {
          const user = users.find(user => user.email === credentials.email);

          if (!user) {
            throw new Error('Usuário não encontrado');
          }

          const senhaCorreta = user.password === credentials.password;

          if (!senhaCorreta) {
            throw new Error('Senha incorreta');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name
          };
        } catch (error) {
          console.error('Erro na autenticação:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  debug: process.env.NODE_ENV === 'development'
});

export { handler as GET, handler as POST }; 

