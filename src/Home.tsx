// src/Home.tsx
import { useNavigate } from "react-router-dom";
import "./theme.css";

const sections = [
  {
    title: "واحة الأمل",
    subtitle: "Clinical Standard",
    icon: "🧠",
    path: "/depression",
  },
  {
    title: "سكينة النفس",
    subtitle: "Clinical Standard",
    icon: "⚡",
    path: "/anxiety",
  },
  {
    title: "توازن الفكر",
    subtitle: "Clinical Standard",
    icon: "❤️",
    path: "/ocd",
  },
  {
    title: "استقرار المزاج",
    subtitle: "Clinical Standard",
    icon: "🌙",
    path: "/bipolar",
  },
  {
    title: "ثقة وتواصل",
    subtitle: "Clinical Standard",
    icon: "👥",
    path: "/social-phobia",
  },
  {
    title: "عقول مميزة",
    subtitle: "Ages 3 – 12",
    icon: "🧩",
    path: "/autism",
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <h1 className="app-title">اختر العيادة المناسبة لك</h1>

      <div className="cards-container">
        {sections.map((section) => (
          <div
            key={section.title}
            className="clinic-card"
            onClick={() => navigate(section.path)}
          >
            <div className="clinic-icon">{section.icon}</div>
            <div className="clinic-content">
              <h2>{section.title}</h2>
              <span>{section.subtitle}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
