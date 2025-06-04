import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Wallet {
    balance: Float
    currency: String
    totalSpent: Float
    totalEarned: Float
  }

  type User {
    id: ID!
    fullName: String
    email: String
    role: String
    wallet: Wallet
  }

  type Query {
    me: User
  }

  type Mutation {
    updateProfile(fullName: String, email: String): User
  }
`;
