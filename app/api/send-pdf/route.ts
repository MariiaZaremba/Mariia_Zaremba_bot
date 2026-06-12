import { NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFileSync } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const {
      userId,
      protein,
      carbs,
      fat,
      veg,
      proteinMeal,
      carbsMeal,
      fatMeal,
      vegMeal,
      meals,
    } = data;

    if (!userId) {
      return NextResponse.json({ success: false, error: "No userId" }, { status: 400 });
    }

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const regularFontBytes = readFileSync(
      path.join(process.cwd(), "public", "fonts", "NotoSans-Regular.ttf")
    );

    const boldFontBytes = readFileSync(
      path.join(process.cwd(), "public", "fonts", "NotoSans.ttf")
    );

    const font = await pdfDoc.embedFont(regularFontBytes);
    const bold = await pdfDoc.embedFont(boldFontBytes);

    const page = pdfDoc.addPage([595, 842]);

    const green = rgb(0.28, 0.49, 0.2);
    const dark = rgb(0.12, 0.18, 0.1);
    const light = rgb(0.94, 0.97, 0.92);
    const white = rgb(1, 1, 1);
    const softGreen = rgb(0.86, 0.94, 0.8);
    const yellow = rgb(1, 0.92, 0.68);
    const blue = rgb(0.82, 0.91, 0.97);
    const peach = rgb(1, 0.88, 0.72);

    function text(txt: string, x: number, y: number, size = 12, isBold = false, color = dark, maxWidth?: number) {
      page.drawText(txt, {
        x,
        y,
        size,
        font: isBold ? bold : font,
        color,
        maxWidth,
        lineHeight: size * 1.25,
      });
    }

    function roundedBox(x: number, y: number, w: number, h: number, color = white) {
      page.drawRectangle({ x, y, width: w, height: h, color });
    }

    page.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: light });

    roundedBox(35, 35, 525, 772, white);

    text("Твій персональний", 65, 745, 20, true, green);
    text("трекер порцій", 65, 708, 38, true, dark);

    text(`Прийомів їжі на день: ${meals}`, 65, 675, 12, false, dark);
    text(`Instagram: @ro_mashka_fit`, 65, 655, 12, false, green);

    roundedBox(65, 600, 465, 45, softGreen);
    text("Орієнтовна денна схема", 85, 617, 16, true, green);

    const results = [
      { label: "Білок", value: `${protein} долонь на день`, meal: `${proteinMeal} на прийом`, color: blue },
      { label: "Овочі/фрукти", value: `${veg} кулаків на день`, meal: `${vegMeal} на прийом`, color: softGreen },
      { label: "Вуглеводи", value: `${carbs} жмень на день`, meal: `${carbsMeal} на прийом`, color: yellow },
      { label: "Жири", value: `${fat} великих пальців на день`, meal: `${fatMeal} на прийом`, color: peach },
    ];

    let y = 545;

    results.forEach((item) => {
      roundedBox(65, y, 465, 48, item.color);
      text(item.label, 85, y + 27, 12, true, dark);
      text(item.value, 210, y + 27, 12, true, dark);
      text(item.meal, 210, y + 10, 10, false, dark);
      y -= 58;
    });

    text("Трекер на 7 днів", 65, 300, 18, true, green);

    const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
    y = 270;

    days.forEach((day) => {
      text(day, 70, y, 10, true, dark);
      text("Білок", 110, y, 9, true, dark);
      text("○ ○ ○", 155, y, 9, false, dark);
      text("Овочі", 220, y, 9, true, dark);
      text("○ ○ ○ ○ ○", 265, y, 9, false, dark);
      text("Вуглеводи", 350, y, 9, true, dark);
      text("○ ○ ○", 430, y, 9, false, dark);
      y -= 24;
    });

    text("Правило руки", 65, 95, 16, true, green);
    text("Білок = 1 долоня • Жири = 1 великий палець", 65, 72, 10, false, dark);
    text("Вуглеводи = 1 жменя • Овочі/фрукти = 1 кулак", 65, 55, 10, false, dark);

    const page2 = pdfDoc.addPage([595, 842]);

    function text2(txt: string, x: number, y: number, size = 12, isBold = false, color = dark, maxWidth?: number) {
      page2.drawText(txt, {
        x,
        y,
        size,
        font: isBold ? bold : font,
        color,
        maxWidth,
        lineHeight: size * 1.25,
      });
    }

    function box2(x: number, y: number, w: number, h: number, color = white) {
      page2.drawRectangle({ x, y, width: w, height: h, color });
    }

    page2.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: light });
    box2(35, 35, 525, 772, white);

    text2("Як користуватись правилом руки", 65, 750, 26, true, green, 460);

    const info = [
      {
        title: "Білок",
        body: "М’ясо, риба, яйця, морепродукти, кисломолочні продукти, тофу, бобові.",
      },
      {
        title: "Овочі та фрукти",
        body: "Салати, зелень, броколі, огірки, помідори, ягоди, яблука, сезонні овочі.",
      },
      {
        title: "Вуглеводи",
        body: "Крупи, картопля, батат, цільнозерновий хліб, паста, фрукти.",
      },
      {
        title: "Жири",
        body: "Авокадо, оливкова олія, горіхи, насіння, масло, жирна риба.",
      },
    ];

    y = 680;

    info.forEach((item, index) => {
      const colors = [blue, softGreen, yellow, peach];
      box2(65, y - 12, 465, 75, colors[index]);
      text2(item.title, 85, y + 35, 15, true, dark);
      text2(item.body, 85, y + 8, 10, false, dark, 420);
      y -= 95;
    });

    text2("Важливо", 65, 285, 18, true, green);
    text2(
      "Це орієнтовна схема, а не медична рекомендація. Її можна адаптувати під голод, самопочуття, тренування, цикл, режим дня та особисті цілі.",
      65,
      245,
      11,
      false,
      dark,
      460
    );

    text2("Твій бот:", 65, 160, 13, true, green);
    text2("t.me/ro_mashka_fit_bot/hand_portions", 65, 135, 12, false, dark);

    text2("@ro_mashka_fit", 65, 70, 14, true, green);

    const pdfBytes = await pdfDoc.save();

    const formData = new FormData();
    formData.append("chat_id", String(userId));
    formData.append("caption", "Твій PDF-чеклист за правилом руки готовий 🥑");
    formData.append(
      "document",
      new Blob([Buffer.from(pdfBytes)], { type: "application/pdf" }),
      "treker-portsiy.pdf"
    );

    const telegramRes = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendDocument`,
      {
        method: "POST",
        body: formData,
      }
    );

    const telegramData = await telegramRes.json();

    if (!telegramData.ok) {
      return NextResponse.json({ success: false, error: telegramData }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
