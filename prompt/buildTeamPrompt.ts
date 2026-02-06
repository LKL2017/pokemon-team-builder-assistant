// prompt/buildTeamPrompt.ts

import { SYSTEM_PROMPT } from "./system"

/**
 * 基础类型定义（可与你项目中的类型合并）
 */
export type PokemonSlot = {
  name: string
  roles: string[]
  notes?: string
}

export type Team = {
  format: "63-single" | "64-double"
  strategyTags?: string[]
  lockedPokemon?: string[]        // 用户明确锁定不可替换的宝可梦
  rejectedPokemon?: string[]      // 用户明确不想用的宝可梦
  pokemon: PokemonSlot[]
}

/**
 * 将队伍结构转为 LLM 友好的文本描述
 */
function describeTeam(team: Team): string {
  if (team.pokemon.length === 0) {
    return "当前队伍为空。"
  }

  return team.pokemon
    .map((p, index) => {
      const roleText = p.roles.length > 0
        ? `角色：${p.roles.join(" / ")}`
        : "角色：未明确"

      const noteText = p.notes
        ? `补充说明：${p.notes}`
        : ""

      return `- ${index + 1}. ${p.name}
  ${roleText}
  ${noteText}`.trim()
    })
    .join("\n")
}

/**
 * 构建最终给 LLM 的 user prompt
 */
export function buildTeamPrompt(team: Team): {
  system: string
  user: string
} {
  const formatText =
    team.format === "63-single"
      ? "官方正作规则 · 63 单打"
      : "官方正作规则 · 64 双打"

  const strategyText =
    team.strategyTags && team.strategyTags.length > 0
      ? `队伍当前倾向：${team.strategyTags.join(" / ")}`
      : "队伍整体风格尚未锁定。"

  const lockedText =
    team.lockedPokemon && team.lockedPokemon.length > 0
      ? `以下宝可梦为玩家明确锁定，不可替换：${team.lockedPokemon.join("、")}`
      : ""

  const rejectedText =
    team.rejectedPokemon && team.rejectedPokemon.length > 0
      ? `以下宝可梦或方向为玩家明确拒绝，请避免推荐：${team.rejectedPokemon.join("、")}`
      : ""

  const userPrompt = `
当前对战规则：
${formatText}

${strategyText}

当前队伍成员：
${describeTeam(team)}

${lockedText}
${rejectedText}

请完成以下任务（遵守 system 指令）：

1. 用对战语境总结当前队伍“已经具备的能力”
2. 指出当前队伍最明显的结构风险或缺口（用“怕什么局面”来描述）
3. 给出 2～3 个不同的补强方向（而不是具体唯一答案）
   - 每个方向请说明：解决了什么问题？代价是什么？
4. 不要一次性生成完整 6 只宝可梦
5. 不要给出唯一正确解，允许非最优但合理的选择
`.trim()

  return {
    system: SYSTEM_PROMPT,
    user: userPrompt
  }
}
