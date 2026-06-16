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
      gender,
      activity,
      goal,
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

    const genderText = gender === "female" ? "Жінка" : "Чоловік";
    const activityText =
      activity === "low" ? "Низький" : activity === "medium" ? "Середній" : "Високий";
    const goalText =
      goal === "lose" ? "Схуднення" : goal === "maintain" ? "Підтримка" : "Набір ваги/мʼязів";

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const regularFontBytes = readFileSync(
      path.join(process.cwd(), "public", "fonts", "NotoSans-Regular.ttf")
    );

    const boldFontBytes = readFileSync(
      path.join(process.cwd(), "public", "fonts", "NotoSans-Bold.ttf")
    );

    const font = await pdfDoc.embedFont(regularFontBytes);
    const bold = await pdfDoc.embedFont(boldFontBytes);

    const page = pdfDoc.addPage([595, 842]);

    const bgBytes = readFileSync(
      path.join(process.cwd(), "public", "pdf", "page1.png")
    );

    const bgImage = await pdfDoc.embedPng(bgBytes);

    page.drawImage(bgImage, {
      x: 0,
      y: 0,
      width: 595,
      height: 842,
    });

    const dark = rgb(0.1, 0.16, 0.08);
    const green = rgb(0.28, 0.48, 0.2);
    const blue = rgb(0.1, 0.37, 0.65);
    const amber = rgb(0.78, 0.55, 0.08);
    const orange = rgb(0.9, 0.42, 0.25);

    function text(
      txt: string,
      x: number,
      y: number,
      size = 12,
      isBold = false,
      color = dark
    ) {
      page.drawText(txt, {
        x,
        y,
        size,
        font: isBold ? bold : font,
        color,
      });
    }

    function circle(x: number, y: number, r: number, color = green) {
      page.drawEllipse({
        x,
        y,
        xScale: r,
        yScale: r,
        borderColor: color,
        borderWidth: 1.4,
      });
    }

    function circles(count: number, x: number, y: number, color = green) {
      const total = Math.max(1, Math.round(Number(count || 0)));
      for (let i = 0; i < total; i++) {
        circle(x + i * 15, y, 4.5, color);
      }
    }

    // Вхідні дані клієнта
text(genderText, 55, 665, 12, true, dark);
text(activityText, 170, 665, 12, true, dark);
text(goalText, 338, 665, 12, true, dark);
text(String(meals), 500, 665, 12, true, dark);

// Значення у верхніх картках
text(String(protein), 90, 595, 24, true, green);
text(String(veg), 231, 595, 24, true, green);
text(String(carbs), 354, 595, 24, true, green);
text(String(fat), 510, 595, 24, true, green);

// Порції на прийом їжі
text(`${proteinMeal}  на прийом`, 60, 569, 8, false, green);
text(`${vegMeal} на прийом`, 230, 569, 8, false, green);
text(`${carbsMeal} на прийом`, 360, 569, 8, false, green);
text(`${fatMeal} на прийом`, 480, 569, 8, false, green);

// Кружечки в чеклисті
const daysY = [348, 280, 230, 198, 149, 100, 50];

daysY.forEach((y) => {
  circles(protein, 115, y, blue);
  circles(veg, 240, y, green);
  circles(carbs, 349, y, amber);
  circles(fat, 480, y, orange);
});

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
