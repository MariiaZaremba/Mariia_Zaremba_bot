"use client";

import { useState } from "react";

type Gender = "female" | "male";
type Activity = "low" | "medium" | "high";
type Goal = "lose" | "maintain" | "gain";

export default function Home() {
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState<Gender | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [meals, setMeals] = useState<number | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  function portionRange(value: number) {
    if (value < 1) return "до 1";
    if (Number.isInteger(value)) return String(value);
    return `${Math.floor(value)}-${Math.ceil(value)}`;
  }

  function calculate() {
    if (!gender || !activity || !goal || !meals) return null;

    let protein = gender === "female" ? 3 : 6;
    let carbs = gender === "female" ? 3 : 6;
    let fat = gender === "female" ? 3 : 6;
    const veg = 5;

    if (activity === "high") {
      protein += 2;
      carbs += 4;
      fat += 1;
    }

    if (goal === "lose") {
      protein += 1;
      carbs -= 1;
      fat -= 1;
    }

    if (goal === "maintain") {
      protein += 1;
      carbs += 1;
      fat += 1;
    }

    if (goal === "gain") {
      protein += 1;
      carbs += 3;
      fat += 1;
    }

    protein = Math.max(protein, 3);
    carbs = Math.max(carbs, 1);
    fat = Math.max(fat, 1);

    return {
      protein,
      carbs,
      fat,
      veg,
      proteinMeal: portionRange(protein / meals),
      carbsMeal: portionRange(carbs / meals),
      fatMeal: portionRange(fat / meals),
      vegMeal: portionRange(veg / meals),
    };
  }

  const result = calculate();

  return (
    <main className="page">
      <section className="card">
        <div className="badge"> 🖐 правило руки</div>

        <h1>Калькулятор порцій</h1>
        <p className="subtitle">
          Розрахуй орієнтовну денну схему харчування без калорій і складних формул.
        </p>

        <div className="progress">
          <div style={{ width: `${(step / 5) * 100}%` }} />
        </div>

        {step === 1 && (
          <Block title="1. Обери стать">
            <Button
              active={gender === "female"}
              onClick={() => {
                setGender("female");
                setStep(2);
              }}
            >
              Жінка
            </Button>
            <Button
              active={gender === "male"}
              onClick={() => {
                setGender("male");
                setStep(2);
              }}
            >
              Чоловік
            </Button>
          </Block>
        )}

        {step === 2 && (
          <Block title="2. Який у тебе рівень активності?">
            <div className="hintBox">
              <p>
                <strong>Низький:</strong>
                <br />
                — сидяча робота
                <br />
                — мало руху
                <br />
                — тренувань майже немає
              </p>

              <p>
                <strong>Середній:</strong>
                <br />
                — 2–4 тренування на тиждень
                <br />
                — приблизно 6–10 тис. кроків на день
              </p>

              <p>
                <strong>Високий:</strong>
                <br />
                — 4+ тренувань на тиждень
                <br />
                — або активна робота
                <br />
                — або багато руху протягом дня
              </p>

              <p className="tip">
                💡 <strong>Якщо сумніваєшся — краще обери нижчий рівень.</strong>
              </p>
            </div>

            <Button
              active={activity === "low"}
              onClick={() => {
                setActivity("low");
                setStep(3);
              }}
            >
              Низький
            </Button>
            <Button
              active={activity === "medium"}
              onClick={() => {
                setActivity("medium");
                setStep(3);
              }}
            >
              Середній
            </Button>
            <Button
              active={activity === "high"}
              onClick={() => {
                setActivity("high");
                setStep(3);
              }}
            >
              Високий
            </Button>
          </Block>
        )}

        {step === 3 && (
          <Block title="3. Яка твоя ціль зараз?">
            <Button
              active={goal === "lose"}
              onClick={() => {
                setGoal("lose");
                setStep(4);
              }}
            >
              Схуднення
            </Button>
            <Button
              active={goal === "maintain"}
              onClick={() => {
                setGoal("maintain");
                setStep(4);
              }}
            >
              Підтримка
            </Button>
            <Button
              active={goal === "gain"}
              onClick={() => {
                setGoal("gain");
                setStep(4);
              }}
            >
              Набір ваги/мʼязів
            </Button>
          </Block>
        )}

        {step === 4 && (
          <Block title="4. Скільки прийомів їжі в день?">
            <div className="mealGrid">
              {[1, 2, 3, 4, 5].map((item) => (
                <button
                  key={item}
                  className={meals === item ? "meal active" : "meal"}
                  onClick={() => {
                    setMeals(item);
                    setStep(5);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </Block>
        )}

        {step === 5 && result && (
          <section className="result">
            <h2>Ось твоя орієнтовна схема 👇</h2>

            <div className="resultGrid">
              <ResultItem icon="🥩" label="Білок" value={`${result.protein} долонь на день`} />
              <ResultItem icon="🥦" label="Овочі/фрукти" value={`${result.veg} кулаків на день`} />
              <ResultItem icon="🍚" label="Вуглеводи" value={`${result.carbs} жмень на день`} />
              <ResultItem icon="🥑" label="Жири" value={`${result.fat} великих пальців на день`} />
            </div>

            <div className="mealResult">
              <h3>На 1 прийом їжі:</h3>
              <p>🥩 Білок: {result.proteinMeal} долоні</p>
              <p>🥦 Овочі: {result.vegMeal} кулака</p>
              <p>🍚 Вуглеводи: {result.carbsMeal} жмені</p>
              <p>🥑 Жири: {result.fatMeal} пальця</p>
            </div>

            <button
  className="pdfButton"
 onClick={async () => {
  setLoadingPdf(true);

  try {
    const tg = (window as any).Telegram?.WebApp;

    const userId = tg?.initDataUnsafe?.user?.id;

    if (!userId) {
      alert("Відкрий калькулятор саме через Telegram Mini App, не через браузер.");
      return;
    }

    const response = await fetch("/api/send-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
        veg: result.veg,
        proteinMeal: result.proteinMeal,
        carbsMeal: result.carbsMeal,
        fatMeal: result.fatMeal,
        vegMeal: result.vegMeal,
        meals,
      }),
    });

    const data = await response.json();

    if (data.success) {
      tg?.showAlert(
        "PDF надіслано в чат 🥑",
        () => tg?.close()
      );
    } else {
      alert(`Помилка: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    alert(`Помилка: ${err}`);
  } finally {
    setLoadingPdf(false);
  }
}}
>
 {loadingPdf
  ? "⏳ Генеруємо PDF..."
  : "📄 Отримати PDF-чеклист у бот"}
</button>

            <button
              className="secondaryButton"
              onClick={() => {
                setStep(1);
                setGender(null);
                setActivity(null);
                setGoal(null);
                setMeals(null);
              }}
            >
              🔄 Новий розрахунок
            </button>
          </section>
        )}

        {step > 1 && step < 5 && (
          <button className="backButton" onClick={() => setStep(step - 1)}>
            ← Назад
          </button>
        )}
      </section>
    </main>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="block">
      <h2>{title}</h2>
      <div className="buttons">{children}</div>
    </section>
  );
}

function Button({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button className={active ? "choice active" : "choice"} onClick={onClick}>
      {children}
    </button>
  );
}

function ResultItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="resultItem">
      <span>{icon}</span>
      <div>
        <strong>{label}</strong>
        <p>{value}</p>
      </div>
    </div>
  );
}
