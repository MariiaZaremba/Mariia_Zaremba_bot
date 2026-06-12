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
      path.join(process.cwd(), "public", "fonts", "NotoSans-Bold.ttf")
    );

    const font = await pdfDoc.embedFont(regularFontBytes);
    const bold = await pdfDoc.embedFont(boldFontBytes);

    const page = pdfDoc.addPage([595, 842]);

    // --- PALETTE ---
    const brandGreen  = rgb(0.278, 0.478, 0.200); // #477A33
    const darkGreen   = rgb(0.118, 0.169, 0.078); // #1E2B14
    const cream       = rgb(0.961, 0.941, 0.910); // #F5F0E8
    const white       = rgb(1, 1, 1);
    const mintLight   = rgb(0.831, 0.929, 0.792); // #D4EDCA
    const mintSection = rgb(0.914, 0.953, 0.871); // #EAF3DE
    const blueLight   = rgb(0.784, 0.902, 0.969); // #C8E6F7
    const yellowLight = rgb(1.000, 0.941, 0.678); // #FFF0AD
    const peachLight  = rgb(1.000, 0.867, 0.710); // #FFDDB5

    const blueAccent   = rgb(0.094, 0.373, 0.647); // #185FA5
    const greenAccent  = rgb(0.231, 0.427, 0.067); // #3B6D11
    const amberAccent  = rgb(0.522, 0.310, 0.043); // #854F0B
    const orangeAccent = rgb(0.910, 0.514, 0.290); // #E8834A

    const blueText   = rgb(0.016, 0.173, 0.325); // #042C53
    const greenText  = rgb(0.090, 0.314, 0.016); // #173404
    const amberText  = rgb(0.255, 0.141, 0.008); // #412402
    const peachText  = rgb(0.290, 0.106, 0.047); // #4A1B0C
    const muted      = rgb(0.500, 0.500, 0.500);
    const rowAlt     = rgb(0.976, 0.992, 0.965); // #F9FBF7

    function text(
      txt: string,
      x: number,
      y: number,
      size = 12,
      isBold = false,
      color = darkGreen,
      maxWidth?: number
    ) {
      page.drawText(txt, { x, y, size, font: isBold ? bold : font, color, maxWidth, lineHeight: size * 1.3 });
    }

    function rect(x: number, y: number, w: number, h: number, color = white) {
      page.drawRectangle({ x, y, width: w, height: h, color });
    }

    // ── PAGE 1 BACKGROUND ────────────────────────────────────────────────────
    rect(0, 0, 595, 842, cream);
    rect(35, 35, 525, 772, white);

    // ── HEADER (compact) ─────────────────────────────────────────────────────
    text("Твій персональний", 65, 780, 11, false, brandGreen);
    text("трекер порцій", 65, 752, 28, true, darkGreen);
    rect(65, 747, 155, 2, brandGreen);
    text(`Прийомів їжі на день: ${meals}`, 65, 733, 10, false, muted);
    text("@ro_mashka_fit", 300, 733, 10, true, brandGreen);

    // ── GOALS — compact 2×2 grid ──────────────────────────────────────────────
    // section label
    rect(65, 694, 465, 30, mintSection);
    rect(65, 694, 5, 30, brandGreen);
    text("Твої цілі", 82, 703, 11, true, brandGreen);

    // 2-column grid: left col x=65, right col x=300; card height=52, gap=6
    const goalCards = [
      {
        label: "Білок",
        day: `${protein} долонь / день`,
        meal: `${proteinMeal} / прийом`,
        bg: blueLight, stripe: blueAccent, titleColor: blueText, subColor: blueAccent,
        x: 65,
      },
      {
        label: "Овочі / фрукти",
        day: `${veg} кулаків / день`,
        meal: `${vegMeal} / прийом`,
        bg: mintLight, stripe: greenAccent, titleColor: greenText, subColor: greenAccent,
        x: 300,
      },
      {
        label: "Вуглеводи",
        day: `${carbs} жмені / день`,
        meal: `${carbsMeal} / прийом`,
        bg: yellowLight, stripe: amberAccent, titleColor: amberText, subColor: amberAccent,
        x: 65,
      },
      {
        label: "Жири",
        day: `${fat} пальців / день`,
        meal: `${fatMeal} / прийом`,
        bg: peachLight, stripe: orangeAccent, titleColor: peachText, subColor: orangeAccent,
        x: 300,
      },
    ];

    // row 1 at y=636, row 2 at y=578
    const goalRows = [636, 578];
    goalCards.forEach((c, i) => {
      const y = goalRows[Math.floor(i / 2)];
      const w = 227;
      rect(c.x, y, w, 52, c.bg);
      rect(c.x, y, 4, 52, c.stripe);
      text(c.label,  c.x + 12, y + 36, 9,  true,  c.titleColor);
      text(c.day,    c.x + 12, y + 22, 11, true,  c.titleColor);
      text(c.meal,   c.x + 12, y + 9,  8,  false, c.subColor);
    });
    // gap between columns
    // (300 - 65 - 227 = 8px gap — natural)

    // ── 7-DAY TRACKER (main focus) ────────────────────────────────────────────
    rect(65, 548, 465, 24, mintSection);
    rect(65, 548, 5, 24, brandGreen);
    text("Трекер на 7 днів", 82, 557, 13, true, brandGreen);

    // column headers
    const colX = [68, 110, 215, 330, 430];
    rect(65, 530, 465, 14, rgb(0.95, 0.97, 0.93));
    text("День", colX[0] + 4, 533, 7, true, brandGreen);
    text("Білок",      colX[1], 533, 7, true, blueAccent);
    text("Овочі",      colX[2], 533, 7, true, greenAccent);
    text("Вуглеводи",  colX[3], 533, 7, true, amberAccent);
    text("Жири",       colX[4], 533, 7, true, orangeAccent);

    // circle legend (tiny, under header)
    text(`(${protein})`, colX[1], 522, 6, false, blueAccent);
    text(`(${veg})`,     colX[2], 522, 6, false, greenAccent);
    text(`(${carbs})`,   colX[3], 522, 6, false, amberAccent);
    text(`(${fat})`,     colX[4], 522, 6, false, orangeAccent);

    const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
    let y = 510;

    days.forEach((day, i) => {
      const rowBg = i % 2 === 0 ? white : rowAlt;
      rect(65, y - 5, 465, 20, rowBg);
      rect(65, y - 5, 3, 20, brandGreen);

      text(day, colX[0] + 4, y, 9, true, brandGreen);

      // protein circles
      const pCount = Math.round(Number(protein));
      for (let c = 0; c < Math.min(pCount, 6); c++)
        text("○", colX[1] + c * 14, y, 10, false, blueAccent);

      // veg circles
      const vCount = Math.round(Number(veg));
      for (let c = 0; c < Math.min(vCount, 6); c++)
        text("○", colX[2] + c * 14, y, 10, false, greenAccent);

      // carbs circles
      const cCount = Math.round(Number(carbs));
      for (let c = 0; c < Math.min(cCount, 6); c++)
        text("○", colX[3] + c * 14, y, 10, false, amberAccent);

      // fat circles
      const fCount = Math.round(Number(fat));
      for (let c = 0; c < Math.min(fCount, 6); c++)
        text("○", colX[4] + c * 14, y, 10, false, orangeAccent);

      y -= 22;
    });

    // ── FOOTER ───────────────────────────────────────────────────────────────
    rect(65, 90, 465, 1, mintSection);
    text("Правило руки", 65, 76, 10, true, brandGreen);
    text(
      "Білок = 1 долоня  ·  Жири = 1 великий палець  ·  Вуглеводи = 1 жменя  ·  Овочі = 1 кулак",
      65, 60, 8, false, muted, 460
    );

    // ════════════════════════════════════════════════════════════════════════
    //  PAGE 2
    // ════════════════════════════════════════════════════════════════════════
    const page2 = pdfDoc.addPage([595, 842]);

    function text2(
      txt: string,
      x: number,
      y: number,
      size = 12,
      isBold = false,
      color = darkGreen,
      maxWidth?: number
    ) {
      page2.drawText(txt, { x, y, size, font: isBold ? bold : font, color, maxWidth, lineHeight: size * 1.3 });
    }

    function rect2(x: number, y: number, w: number, h: number, color = white) {
      page2.drawRectangle({ x, y, width: w, height: h, color });
    }

    rect2(0, 0, 595, 842, cream);
    rect2(35, 35, 525, 772, white);

    // ── PAGE 2 HEADER ────────────────────────────────────────────────────────
    text2("Як користуватись", 65, 768, 22, true, darkGreen);
    text2("правилом руки", 65, 740, 22, true, brandGreen);
    rect2(65, 734, 145, 2, brandGreen);

    // ── INFO CARDS ────────────────────────────────────────────────────────────
    const info = [
      {
        title: "Білок",
        body: "М'ясо, риба, яйця, морепродукти, кисломолочні продукти, тофу, бобові.",
        bg: blueLight, stripe: blueAccent, titleColor: blueText, bodyColor: blueAccent,
      },
      {
        title: "Овочі та фрукти",
        body: "Салати, зелень, броколі, огірки, помідори, ягоди, яблука, сезонні овочі.",
        bg: mintLight, stripe: greenAccent, titleColor: greenText, bodyColor: greenAccent,
      },
      {
        title: "Вуглеводи",
        body: "Крупи, картопля, батат, цільнозерновий хліб, паста, фрукти.",
        bg: yellowLight, stripe: amberAccent, titleColor: amberText, bodyColor: amberAccent,
      },
      {
        title: "Жири",
        body: "Авокадо, оливкова олія, горіхи, насіння, масло, жирна риба.",
        bg: peachLight, stripe: orangeAccent, titleColor: peachText, bodyColor: orangeAccent,
      },
    ];

    let y2 = 690;
    info.forEach((item) => {
      rect2(65, y2, 465, 66, item.bg);
      rect2(65, y2, 5, 66, item.stripe);
      text2(item.title, 83, y2 + 45, 13, true, item.titleColor);
      text2(item.body, 83, y2 + 13, 9, false, item.bodyColor, 420);
      y2 -= 75;
    });

    // ── IMPORTANT BOX ────────────────────────────────────────────────────────
    rect2(65, 260, 465, 62, mintSection);
    rect2(65, 260, 5, 62, brandGreen);
    text2("Важливо", 83, 305, 11, true, brandGreen);
    text2(
      "Це орієнтовна схема, а не медична рекомендація. Її можна адаптувати під\nголод, самопочуття, тренування, цикл, режим дня та особисті цілі.",
      83, 278, 9, false, darkGreen, 430
    );

    // ── FOOTER ───────────────────────────────────────────────────────────────
    rect2(65, 155, 465, 1, mintSection);
    text2("Твій бот:", 65, 138, 10, true, brandGreen);
    text2("t.me/ro_mashka_fit_bot/hand_portions", 65, 122, 10, false, darkGreen);
    rect2(65, 72, 465, 1, mintSection);
    text2("@ro_mashka_fit", 65, 52, 13, true, brandGreen);

    // ════════════════════════════════════════════════════════════════════════
    //  SEND PDF VIA TELEGRAM
    // ════════════════════════════════════════════════════════════════════════
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
