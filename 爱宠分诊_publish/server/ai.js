const config = require('./config');

// 调用 DeepSeek 对问诊做 AI 分诊，返回文本结果
async function triage(consult, pet) {
  const systemPrompt = `你是一位经验丰富的宠物兽医分诊助手。请根据宠物主人的描述给出专业、谨慎的分诊建议。

请严格按以下格式用中文输出（每项另起一行）：
【疑似方向】列出最可能的1-3种情况
【紧急程度】立即就医 / 建议尽快就医 / 可居家观察（三选一）
【初步分析】简要分析可能的病因
【居家护理建议】给出具体可行的护理措施
【就医提醒】什么情况下必须立即去宠物医院

最后必须附上一句：以上为 AI 初步分诊，不能替代兽医面诊，请以实际就诊为准。`;

  const userPrompt = `宠物信息：
- 名字：${pet.name}
- 物种：${pet.species || '未知'}
- 品种：${pet.breed || '未知'}
- 性别：${pet.gender || '未知'}
- 年龄：${pet.age || '未知'}个月
- 体重：${pet.weight || '未知'}

主人的症状描述：
${consult.symptom}

请给出分诊建议。`;

  const r = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + config.deepseekApiKey
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })
  });

  const data = await r.json();
  const content = data.choices && data.choices[0] && data.choices[0].message
    ? data.choices[0].message.content
    : '';
  if (!content) {
    throw new Error(data.error ? data.error.message : 'DeepSeek 返回为空');
  }
  return content;
}

module.exports = { triage };
