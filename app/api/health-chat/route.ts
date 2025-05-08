import { NextResponse } from "next/server"
import { InferenceClient } from "@huggingface/inference"

// สร้าง Hugging Face Inference Client
const client = new InferenceClient("your_token_here")

// คำถามแนะนำเริ่มต้น
const defaultSuggestedQuestions = [
  "วิธีลดน้ำหนักที่ดีที่สุดคืออะไร?",
  "ฉันควรออกกำลังกายบ่อยแค่ไหน?",
  "อาหารที���ดีสำหรับการสร้างกล้ามเนื้อคืออะไร?",
  "วิธีเพิ่มแรงจูงใจในการออกกำลังกาย",
]

// System prompt เพื่อกำหนดบทบาทและความสามารถของ AI
const systemPrompt = `คุณคือผู้ช่วยสุขภาพของ Hyperweight ที่ให้คำแนะนำเกี่ยวกับสุขภาพ การออกกำลังกาย และโภชนาการ
ตอบคำถามด้วยข้อมูลที่ถูกต้องและเป็นประโยชน์ ใช้ภาษาไทยที่เข้าใจง่าย
หากมีคำถามที่ไม่เกี่ยวข้องกับสุขภาพ ให้พยายามนำกลับมาสู่หัวข้อเกี่ยวกับสุขภาพ
ไม่ให้คำแนะนำทางการแพทย์ที่เฉพาะเจาะจง และแนะนำให้ปรึกษาแพทย์สำหรับปัญหาสุขภาพที่จำเพาะ`

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // รับคำถามล่าสุดจากผู้ใช้
    const userQuestion = messages[messages.length - 1].content

    // ตรวจสอบว่าเป็นคำสั่งสอนหรือไม่
    const isTeaching = userQuestion.toLowerCase().trim().startsWith("สอน:")

    // ถ้าเป็นคำสั่งสอน ให้จัดการด้วยวิธีพิเศษ
    if (isTeaching) {
      return handleTeachingCommand(userQuestion)
    }

    // สร้างรูปแบบข้อความสำหรับส่งไปยัง Hugging Face API
    const formattedMessages = [
      {
        role: "system",
        content: systemPrompt,
      },
      // เพิ่มประวัติการสนทนาก่อนหน้า (จำกัดจำนวนเพื่อไม่ให้ context ยาวเกินไป)
      ...messages.slice(-5).map((msg: any) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      })),
    ]

    // เรียกใช้ Hugging Face API
    const chatCompletion = await client.chatCompletion({
      provider: "novita",
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages: formattedMessages,
      max_tokens: 512,
    })

    // ดึงคำตอบจาก API
    const responseContent = chatCompletion.choices[0].message.content

    // สร้างข้อความตอบกลับ
    const responseMessage = {
      role: "assistant",
      content: responseContent,
      source: "llama", // เพิ่มแหล่งที่มาเป็น llama
    }

    // สร้างคำถามแนะนำ (ในกรณีนี้เราใช้คำถามแนะนำเริ่มต้น)
    // ในอนาคตอาจพัฒนาให้สร้างคำถามแนะนำที่เกี่ยวข้องกับบทสนทนา
    const suggestedQuestions = defaultSuggestedQuestions

    // ส่งคำตอบกลับไปยัง client
    return NextResponse.json({
      messages: [responseMessage],
      suggestedQuestions: suggestedQuestions,
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการประมวลผลคำขอของคุณ" }, { status: 500 })
  }
}

// ฟังก์ชันจัดการคำสั่งสอน
async function handleTeachingCommand(command: string) {
  // แยกคำถามและคำตอบ
  const content = command.substring("สอน:".length).trim()
  const parts = content.split("|")

  if (parts.length !== 2) {
    return NextResponse.json({
      messages: [
        {
          role: "assistant",
          content: "รูปแบบการสอนไม่ถูกต้อง กรุณาใช้: สอน: [คำถาม] | [คำตอบ]",
          source: "system",
        },
      ],
      suggestedQuestions: defaultSuggestedQuestions,
    })
  }

  const question = parts[0].trim()
  const answer = parts[1].trim()

  if (!question || !answer) {
    return NextResponse.json({
      messages: [
        {
          role: "assistant",
          content: "คำถามและคำตอบต้องไม่เป็นค่าว่าง กรุณาลองใหม่",
          source: "system",
        },
      ],
      suggestedQuestions: defaultSuggestedQuestions,
    })
  }

  // ในระบบจริงควรมีการบันทึกคำถามและคำตอบลงฐานข้อมูล
  // แต่ในตัวอย่างนี้เราจะจำลองการตอบกลับว่าได้เรียนรู้แล้ว

  return NextResponse.json({
    messages: [
      {
        role: "assistant",
        content: `ขอบคุณที่สอนผม! ตอนนี้ผมเข้าใจแล้วว่าเมื่อถามเกี่ยวกับ "${question}" ผมควรตอบว่า "${answer}"`,
        source: "learned",
      },
    ],
    suggestedQuestions: defaultSuggestedQuestions,
  })
}
