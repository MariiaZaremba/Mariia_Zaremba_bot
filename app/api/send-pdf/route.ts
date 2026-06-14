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

    const green = rgb(0.28, 0.48, 0.2);
    const dark = rgb(0.1, 0.16, 0.08);
    const cream = rgb(0.97, 0.95, 0.9);
    const white = rgb(1, 1, 1);
    const pale = rgb(0.94, 0.97, 0.91);
    const line = rgb(0.72, 0.82, 0.65);
    const blue = rgb(0.78, 0.9, 0.97);
    const mint = rgb(0.83, 0.93, 0.79);
    const yellow = rgb(1, 0.94, 0.68);
    const peach = rgb(1, 0.86, 0.7);
    const blueAccent = rgb(0.1, 0.37, 0.65);
    const greenAccent = rgb(0.23, 0.43, 0.07);
    const amberAccent = rgb(0.78, 0.55, 0.08);
    const orangeAccent = rgb(0.9, 0.42, 0.25);

    function text(
      txt: string,
      x: number,
      y: number,
      size = 12,
      isBold = false,
      color = dark,
      maxWidth?: number
    ) {
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

    function box(x: number, y: number, w: number, h: number, color = white, border = false) {
      page.drawRectangle({
        x,
        y,
        width: w,
        height: h,
        color,
        borderColor: border ? line : undefined,
        borderWidth: border ? 1 : undefined,
      });
    }

    function circle(x: number, y: number, r: number, color = green) {
      page.drawEllipse({
        x,
        y,
        xScale: r,
        yScale: r,
        borderColor: color,
        borderWidth: 1.2,
      });
    }

    function circles(count: number, x: number, y: number, color: any) {
      const total = Math.max(1, Math.round(Number(count || 0)));
      for (let i = 0; i < total; i++) {
        circle(x + i * 13, y, 4.2, color);
      }
    }

    function portionCard(
      x: number,
      y: number,
      w: number,
      bg: any,
      accent: any,
      label: string,
      value: string,
      meal: string
    ) {
      box(x, y, w, 70, bg, true);
      page.drawEllipse({ x: x + 32, y: y + 35, xScale: 23, yScale: 23, color: white });
      text(label, x + 70, y + 45, 11, true, dark);
      text(value, x + 70, y + 24, 20, true, dark);
      text(meal, x + 70, y + 10, 8, false, accent);
    }

    page.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: cream });
    box(32, 30, 531, 782, white, false);

    text("🥑 @ro_mashka_fit", 228, 778, 12, true, green);
    text("Трекер порцій", 130, 720, 44, true, dark);
    text(`Правило руки · Прийомів їжі на день: ${meals}`, 155, 692, 14, true, green);

    box(55, 625, 485, 82, pale, true);
    text("Інформація про клієнта", 75, 682, 14, true, green);

    text("Стать", 95, 650, 9, false, green);
    text(genderText, 95, 632, 12, true, dark);

    text("Активність", 210, 650, 9, false, green);
    text(activityText, 210, 632, 12, true, dark);

    text("Ціль", 335, 650, 9, false, green);
    text(goalText, 335, 632, 12, true, dark);

    text("Прийомів їжі", 455, 650, 9, false, green);
    text(String(meals), 455, 632, 12, true, dark);

    text("Твої порції на день", 55, 585, 15, true, green);
    box(55, 570, 485, 1, line);

    portionCard(55, 490, 235, blue, blueAccent, "Білок", `${protein}`, `${proteinMeal} на прийом`);
    text("долоні", 215, 512, 10, false, dark);

    portionCard(305, 490, 235, mint, greenAccent, "Овочі / фрукти", `${veg}`, `${vegMeal} на прийом`);
    text("кулаків", 465, 512, 10, false, dark);

    portionCard(55, 405, 235, yellow, amberAccent, "Вуглеводи", `${carbs}`, `${carbsMeal} на прийом`);
    text("жмені", 215, 427, 10, false, dark);

    portionCard(305, 405, 235, peach, orangeAccent, "Жири", `${fat}`, `${fatMeal} на прийом`);
    text("великих пальців", 450, 427, 9, false, dark);

    text("Трекер на 7 днів", 55, 360, 17, true, green);
    box(55, 338, 485, 1, line);

    const col = {
      day: 65,
      protein: 125,
      veg: 245,
      carbs: 365,
      fat: 470,
    };

    text("День", col.day, 318, 9, true, dark);
    text("Білок", col.protein, 318, 9, true, blueAccent);
    text("Овочі / фрукти", col.veg, 318, 9, true, greenAccent);
    text("Вуглеводи", col.carbs, 318, 9, true, amberAccent);
    text("Жири", col.fat, 318, 9, true, orangeAccent);

    const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
    let y = 292;

    days.forEach((day, index) => {
      if (index % 2 === 0) box(55, y - 7, 485, 24, rgb(0.98, 0.99, 0.96), false);

      text(day, col.day, y, 12, true, dark);

      circles(protein, col.protein, y + 4, blueAccent);
      circles(veg, col.veg, y + 4, greenAccent);
      circles(carbs, col.carbs, y + 4, amberAccent);
      circles(fat, col.fat, y + 4, orangeAccent);

      y -= 30;
    });

    box(55, 55, 485, 55, pale, true);
    text("Правило руки", 75, 88, 12, true, green);
    text(
      "Білок = 1 долоня  ·  Жири = 1 великий палець  ·  Вуглеводи = 1 жменя  ·  Овочі = 1 кулак",
      75,
      68,
      8,
      false,
      dark,
      440
    );

    const page2 = pdfDoc.addPage([595, 842]);

    function text2(
      txt: string,
      x: number,
      y: number,
      size = 12,
      isBold = false,
      color = dark,
      maxWidth?: number
    ) {
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

    function box2(x: number, y: number, w: number, h: number, color = white, border = false) {
      page2.drawRectangle({
        x,
        y,
        width: w,
        height: h,
        color,
        borderColor: border ? line : undefined,
        borderWidth: border ? 1 : undefined,
      });
    }

    page2.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: cream });
    box2(32, 30, 531, 782, white);

    text2("Як користуватись", 65, 745, 28, true, dark);
    text2("правилом руки", 65, 710, 28, true, green);

    const tips = [
      {
        title: "Білок",
        body: "Мʼясо, риба, яйця, морепродукти, кисломолочні продукти, тофу, бобові.",
        bg: blue,
        color: blueAccent,
      },
      {
        title: "Овочі та фрукти",
        body: "Салати, зелень, броколі, огірки, помідори, ягоди, яблука, сезонні овочі.",
        bg: mint,
        color: greenAccent,
      },
      {
        title: "Вуглеводи",
        body: "Крупи, картопля, батат, цільнозерновий хліб, паста, фрукти.",
        bg: yellow,
        color: amberAccent,
      },
      {
        title: "Жири",
        body: "Авокадо, оливкова олія, горіхи, насіння, масло, жирна риба.",
        bg: peach,
        color: orangeAccent,
      },
    ];

    let y2 = 630;

    tips.forEach((item) => {
      box2(65, y2, 465, 78, item.bg, true);
      text2(item.title, 85, y2 + 48, 14, true, dark);
      text2(item.body, 85, y2 + 22, 9, false, item.color, 410);
      y2 -= 95;
    });

    box2(65, 220, 465, 80, pale, true);
    text2("Важливо", 85, 270, 13, true, green);
    text2(
      "Це орієнтовна схема, а не медична рекомендація. Її можна адаптувати під голод, самопочуття, тренування, цикл, режим дня та особисті цілі.",
      85,
      235,
      10,
      false,
      dark,
      420
    );

    box2(65, 90, 465, 70, white, true);
    text2("Твій бот:", 85, 135, 11, true, green);
    text2("t.me/ro_mashka_fit_bot/hand_portions", 85, 115, 10, false, dark);
    text2("@ro_mashka_fit", 85, 70, 13, true, green);

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
