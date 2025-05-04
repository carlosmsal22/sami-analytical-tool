
import React, { useState } from 'react';
import './App.css';

const prompts = [
  {
    category: "🔍 Discover Unmet Needs",
    items: [
      "Identify unmet customer needs in the wellness industry",
      "What pain points exist in digital banking today?",
      "Help me analyze user feedback to spot hidden opportunities"
    ]
  },
  {
    category: "💡 Brainstorm New Concepts",
    items: [
      "Generate 5 innovative product ideas for Gen Z travelers",
      "What are AI-powered services for remote education?",
      "Use Blue Ocean Strategy to rethink meal kit delivery"
    ]
  },
  {
    category: "🧠 Apply Innovation Frameworks",
    items: [
      "Use Jobs to Be Done to improve our productivity app",
      "Apply the Kano Model to features in my eCommerce platform",
      "Show me how TRIZ can solve bottlenecks in logistics"
    ]
  },
  {
    category: "📈 Explore Emerging Trends",
    items: [
      "What are 2025 innovation trends in renewable energy?",
      "Give me 3 weak signals in the fashion industry",
      "Analyze cross-industry applications of generative AI"
    ]
  },
  {
    category: "🛠 Prototype and Test",
    items: [
      "Create a user testing plan for a new subscription service",
      "What’s a quick MVP for an AI-powered wellness coach?",
      "Suggest ways to validate early-stage startup ideas"
    ]
  },
  {
    category: "🌐 Cross-Sector Inspiration",
    items: [
      "What can retail learn from FinTech innovation?",
      "Apply design thinking from healthcare to education",
      "Transfer ideas from gaming to virtual learning platforms"
    ]
  }
];

function App() {
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  const filteredPrompts = prompts.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  return (
    <div className={darkMode ? 'App dark' : 'App light'}>
      <button className="toggle-btn" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
      <h1>Innovation Scout - Prompt Menu</h1>
      <div className="search-box">
        <input
          type="text"
          placeholder="Search prompts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="grid">
        {filteredPrompts.map(section => (
          <div className="card" key={section.category}>
            <div className="category">{section.category}</div>
            <ul>
              {section.items.map((item, index) => (
                <li key={index}>
                  <a href="https://chatgpt.com/g/g-NHiNlyxxG-innovation-scout" target="_blank" rel="noopener noreferrer">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
