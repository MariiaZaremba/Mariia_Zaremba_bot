import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

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
    const page = pdfDoc.addPage([595, 842]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const green = rgb(0.25, 0.48, 0.18);
    const lightGreen = rgb(0.9, 0.96, 0.86);
    const dark = rgb(0.12, 0.18, 0.1);

    page.drawRectangle({
      x: 0,
      y: 0,
      width: 595,
      height: 842,
      color: rgb(0.94, 0.97, 0.92),
    });

    page.drawText("Tviy personalnyi treker portsiy", {
      x: 55,
      y: 780,
      size: 28,
      font: bold,
      color: green,
    });

    page.drawText("Rezultat rozrakhunku", {
      x: 55,
      y: 735,
      size: 18,
      font: bold,
      color: dark,
    });

    const rows = [
      ["BILOK", `${protein} dolon na den / ${proteinMeal} na pryiom`],
      ["OVOCHI/FRUKTY", `${veg} kulakiv na den / ${vegMeal} na pryiom`],
      ["VUHLEVODY", `${carbs} zhmen na den / ${carbsMeal} na pryiom`],
      ["ZHYRY", `${fat} velykykh paltsiv na den / ${fatMeal} na pryiom`],
    ];

    let y = 700;

    rows.forEach(([label, value]) => {
      page.drawRectangle({
        x: 55,
        y: y - 10,
        width: 485,
        height: 36,
        color: lightGreen,
      });

      page.drawText(label, {
        x: 70,
        y,
        size: 12,
        font: bold,
        color: green,
      });

      page.drawText(value, {
        x: 210,
        y,
        size: 12,
        font,
        color: dark,
      });

      y -= 45;
    });

    page.drawText("Treker na 7 dniv", {
      x: 55,
      y: 505,
      size: 18,
      font: bold,
      color: dark,
    });

    const days = ["Pon", "Viv", "Ser", "Chet", "Piat", "Sub", "Ned"];
    y = 470;

    days.forEach((day) => {
      page.drawText(day, { x: 60, y, size: 11, font: bold, color: dark });
      page.drawText("Bilok: ○ ○ ○    Ovochi: ○ ○ ○ ○ ○    Vuhlevody: ○ ○ ○    Zhyry: ○ ○ ○", {
        x: 115,
        y,
        size: 10,
        font,
        color: dark,
      });
      y -= 32;
    });

    page.drawText("Pravylo ruky", {
      x: 55,
      y: 210,
      size: 18,
      font: bold,
      color: dark,
    });

    const rules = [
      "Bilok = 1 dolonia",
      "Zhyry = 1 velykyi palets",
      "Vuhlevody = 1 zhmenia",
      "Ovochi/frukty = 1 kulak",
    ];

    y = 180;
    rules.forEach((text) => {
      page.drawText(text, { x: 70, y, size: 12, font, color: dark });
      y -= 24;
    });

    page.drawText("Pryklady produktiv: miaso, ryba, yaytsia, ovochevi salaty, krupy, kartoplia, avokado, oliia, horikhy.", {
      x: 55,
      y: 70,
      size: 10,
      font,
      color: dark,
      maxWidth: 485,
    });

    page.drawText("@ro_mashka_fit", {
      x: 55,
      y: 35,
      size: 12,
      font: bold,
      color: green,
    });

    const pdfBytes = await pdfDoc.save();

    const formData = new FormData();
    formData.append("chat_id", String(userId));
    formData.append("caption", "Твій PDF-чеклист за правилом руки готовий 🥑");
    formData.append(
      "document",
      new Blob([pdfBytes], { type: "application/pdf" }),
      "hand-portions-checklist.pdf"
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
