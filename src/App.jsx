import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const today = new Date().toISOString().split("T")[0];
  const yyyymmdd = today.replace(/-/g, "");
  const [operator, setOperator] = useState("Vic Liao");
  const [code, setCode] = useState("");
  const [mr, setMR] = useState("M");
  const [drugs, setDrugs] = useState(["", "", "", "", ""]);
  const [animal, setAnimal] = useState({ strain: "", age: "", vendor: "" });
  const [details, setDetails] = useState(
    Array.from({ length: 25 }, () => Array.from({ length: 22 }, () => ""))
  );
  const [records, setRecords] = useState([]);

  const batchId = `${yyyymmdd}-AT-${code.toUpperCase()}-${mr}`;
  const updateDetail = (row, col, value) => {
    const copy = [...details];
    copy[row][col] = value;
    setDetails(copy);
  };

  const headers = [
    "序次",
    "動物體重",
    "藥物名稱",
    "藥物濃度",
    "藥物劑量",
    "給藥體積",
    "Day1", "Day2", "Day3", "Day4", "Day5",
    "Day6", "Day7", "Day8", "Day9", "Day10",
    "Day11", "Day12", "Day13", "Day14", "Day15",
    "備註"
  ];

  const handleSubmit = async () => {
    const data = {
      date: today,
      operator,
      batchId,
      drugs,
      animal,
      details
    };

    try {
      await fetch("https://script.google.com/macros/s/AKfycbwVry5dXlGuhTsN2otoRok4_K3DyaKl2T3qV0gVuO6aoWVL7wsmPpIIMvbV0CTJZkAm/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      alert("✅ 資料已送出至 Google Sheets！");
    } catch (error) {
      alert("❌ 發送失敗，請稍後再試。");
      console.error(error);
    }
  };

  const loadRecords = async () => {
    try {
      const res = await fetch("https://script.google.com/macros/s/AKfycbwVry5dXlGuhTsN2otoRok4_K3DyaKl2T3qV0gVuO6aoWVL7wsmPpIIMvbV0CTJZkAm/exec");
      const json = await res.json();
      setRecords(json);
    } catch (err) {
      console.error("讀取資料失敗：", err);
      alert("❌ 無法讀取資料");
    }
  };

  const loadRecord = (record) => {
    setOperator(record.operator);
    const [dateStr, , codePart, mrPart] = record.batchId.split("-");
    setCode(codePart);
    setMR(mrPart);
    setDrugs(record.drugs);
    setAnimal(record.animal);
    setDetails(record.details);
  };

  return (
    <div style={{ padding: "16px" }}>
      <h1>🧪 實驗紀錄填寫 App</h1>
      <p>試驗時間：{today}</p>
      <label>操作者：
        <select value={operator} onChange={e => setOperator(e.target.value)}>
          <option>Vic Liao</option>
          <option>Winnie Sun</option>
        </select>
      </label>
      <div style={{ marginTop: "8px" }}>
        試驗批次組合：
        <input value={yyyymmdd} disabled style={{ width: 80 }} />
        <input maxLength={3} value={code} onChange={e => setCode(e.target.value)} placeholder="ABX" style={{ width: 60 }} />
        <select value={mr} onChange={e => setMR(e.target.value)}>
          <option value="M">M</option>
          <option value="R">R</option>
        </select>
        <strong> → {batchId}</strong>
      </div>

      <h3 style={{ marginTop: "16px" }}>試驗藥物：</h3>
      {drugs.map((d, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "center" }}>
          <input
            value={d}
            placeholder={`藥物 ${i + 1}`}
            onChange={e => {
              const copy = [...drugs];
              copy[i] = e.target.value;
              setDrugs(copy);
            }}
            style={{ marginBottom: "4px", textAlign: "center" }}
          />
        </div>
      ))}

      <h3>試驗動物：</h3>
      <input placeholder="品系" value={animal.strain} onChange={e => setAnimal({ ...animal, strain: e.target.value })} />
      <input placeholder="週齡" value={animal.age} onChange={e => setAnimal({ ...animal, age: e.target.value })} />
      <input placeholder="供應商" value={animal.vendor} onChange={e => setAnimal({ ...animal, vendor: e.target.value })} />

      <h3 style={{ marginTop: "16px" }}>試驗內容表格</h3>
      <div style={{ overflowX: "scroll", border: "1px solid #ccc" }}>
        <table>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {details.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>
                    <input
                      value={cell}
                      onChange={e => updateDetail(i, j, e.target.value)}
                      style={{ width: 80 }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={handleSubmit} style={{ marginTop: "16px", padding: "8px 16px", background: "#4CAF50", color: "white", border: "none", borderRadius: "4px" }}>
        ➕ 儲存至 Google Sheets
      </button>

      <hr style={{ margin: "24px 0" }} />
      <button onClick={loadRecords} style={{ padding: "8px 16px", background: "#2196F3", color: "white", border: "none", borderRadius: "4px" }}>
        📂 查詢歷史紀錄
      </button>
      {records.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <h4>點選一筆紀錄以下載表單：</h4>
          <ul>
            {records.map((rec, idx) => (
              <li key={idx}>
                <button onClick={() => loadRecord(rec)}>
                  {rec.date} - {rec.batchId} - {rec.operator}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
