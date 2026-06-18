/**
 * Server Function Hooks
 *
 * Customize CRUD behavior with before/after hooks.
 * This file is safe to edit - it will not be overwritten by `bun x shogo generate`.
 */

import type { ServerFunctionHooks } from './types'

export const hooks: ServerFunctionHooks = {
  User: {
    // beforeList: async (ctx) => { return { where: { userId: ctx.userId } } },
    // beforeCreate: async (input, ctx) => { return { ...input, userId: ctx.userId } },
  },
  Company: {
    // beforeList: async (ctx) => { return { where: { userId: ctx.userId } } },
    // beforeCreate: async (input, ctx) => { return { ...input, userId: ctx.userId } },
  },
  Department: {
    // beforeList: async (ctx) => { return { where: { userId: ctx.userId } } },
    // beforeCreate: async (input, ctx) => { return { ...input, userId: ctx.userId } },
  },
  Agent: {
    // beforeList: async (ctx) => { return { where: { userId: ctx.userId } } },
    // beforeCreate: async (input, ctx) => { return { ...input, userId: ctx.userId } },
  },
  Task: {
    // beforeList: async (ctx) => { return { where: { userId: ctx.userId } } },
    // beforeCreate: async (input, ctx) => { return { ...input, userId: ctx.userId } },
  },
  AgentMessage: {
    // beforeList: async (ctx) => { return { where: { userId: ctx.userId } } },
    // beforeCreate: async (input, ctx) => { return { ...input, userId: ctx.userId } },
  },
  AgentMemory: {
    // beforeList: async (ctx) => { return { where: { userId: ctx.userId } } },
    // beforeCreate: async (input, ctx) => { return { ...input, userId: ctx.userId } },
  },
  BrainMemory: {
    // beforeList: async (ctx) => { return { where: { userId: ctx.userId } } },
    // beforeCreate: async (input, ctx) => { return { ...input, userId: ctx.userId } },
  },
  Workflow: {
    // beforeList: async (ctx) => { return { where: { userId: ctx.userId } } },
    // beforeCreate: async (input, ctx) => { return { ...input, userId: ctx.userId } },
  },
  Activity: {
    // beforeList: async (ctx) => { return { where: { userId: ctx.userId } } },
    // beforeCreate: async (input, ctx) => { return { ...input, userId: ctx.userId } },
  },
}

export default hooks
