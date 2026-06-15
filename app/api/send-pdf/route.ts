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

    // ТЕСТОВІ КООРДИНАТИ — зараз підженемо під твій шаблон
    text(genderText, 90, 650, 12, true, dark);
    text(activityText, 210, 650, 12, true, dark);
    text(goalText, 330, 650, 12, true, dark);
    text(String(meals), 470, 650, 12, true, dark);

    text(String(protein), 125, 535, 28, true, blue);
    text(String(veg), 325, 535, 28, true, green);
    text(String(carbs), 125, 455, 28, true, amber);
    text(String(fat), 325, 455, 28, true, orange);

    text(`${proteinMeal} на прийом`, 125, 512, 9, false, blue);
    text(`${vegMeal} на прийом`, 325, 512, 9, false, green);
    text(`${carbsMeal} на прийом`, 125, 432, 9, false, amber);
    text(`${fatMeal} на прийом`, 325, 432, 9, false, orange);

    const daysY = [330, 300, 270, 240, 210, 180, 150];

    daysY.forEach((y) => {
      circles(protein, 130, y, blue);
      circles(veg, 245, y, green);
      circles(carbs, 365, y, amber);
      circles(fat, 470, y, orange);
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
