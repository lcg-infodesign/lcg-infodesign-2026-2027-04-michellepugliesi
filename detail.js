let data;
let currentRow = -1;
let channel = "";
let rankValue = "";
let country = "";
let category = "";
let macro = "Altro";
let rows = [];
let overBack = false;

let backgroundColor = '#0E0F1A';
let textColor = '#F2F2F7';
let mutedColor = '#8A8FA8';

let categoryColors = {
  "Musica": '#FF5D73',
  "Sport": '#3DA5FF',
  "Intrattenimento": '#FFC53D',
  "Creator": '#B26BFF',
  "Moda e media": '#2EE6A6',
  "Altro": '#9AA3B5',
};

let margin = 40;

let fields = [
  ["Influence score", "influence_score"],
  ["Follower", "followers"],
  ["Post pubblicati", "posts"],
  ["Like medi per post", "avg_likes"],
  ["Like medi sui nuovi post", "new_post_avg_likes"],
  ["Like totali", "total_likes"],
  ["Engagement a 60 giorni", "60_day_eng_rate"],
];

async function setup() {
  createCanvas(windowWidth, windowHeight);

  data = await loadTable("instagram_global_influencers_2026.csv", ",", "header");

  let params = new URLSearchParams(window.location.search);
  let id = params.get("id");

  for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
    if (data.getString(rowNumber, "rank") === id) {
      currentRow = rowNumber;
    }
  }

  if (currentRow >= 0) {
    channel = data.getString(currentRow, "channel_info");
    rankValue = data.getString(currentRow, "rank");
    country = data.getString(currentRow, "country");
    category = data.getString(currentRow, "category");
    macro = macroCategory(category);

    // valore del profilo e sua posizione tra i profili 
    for (let field of fields) {
      let value = data.getNum(currentRow, field[1]);
      let position = 1;
      for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
        if (data.getNum(rowNumber, field[1]) > value) {
          position++;
        }
      }
      rows.push({
        label: field[0],
        value: formatNumber(field[1], value),
        position: "n° " + position + " su " + data.getRowCount(),
      });
    }

    let delta = data.getNum(currentRow, "new_post_avg_likes") / data.getNum(currentRow, "avg_likes") - 1;
    rows.push({
      label: "Nuovi post rispetto alla media",
      value: (delta >= 0 ? "+" : "") + (delta * 100).toFixed(1) + " %",
      position: "calcolato",
    });
  }
}

function draw() {
  background(backgroundColor);

  // pulsante per tornare alla griglia, cambia aspetto se il mouse è sopra.
  textSize(14);
  textAlign(LEFT, TOP);
  let backLabel = "←  Tutti i profili";
  overBack =
    mouseX >= margin && mouseX <= margin + textWidth(backLabel) && mouseY >= 25 && mouseY <= 50;
  noStroke();
  fill(overBack ? textColor : mutedColor);
  text(backLabel, margin, 30);
  cursor(overBack ? HAND : ARROW);

  if (currentRow < 0) {
    fill(textColor);
    textSize(24);
    text("Profilo non trovato", margin, 90);
    return;
  }

  // colonna sinistra
  let iconSize = min(width * 0.2, height * 0.3, 200);
  let iconX = width * 0.26;
  let iconY = height * 0.38;

  drawInstagramIcon(iconX, iconY, iconSize, categoryColors[macro]);

  textAlign(CENTER, TOP);
  fill(textColor);
  textStyle(BOLD);
  textSize(28);
  text("@" + channel, iconX, iconY + iconSize / 2 + 45);
  textStyle(NORMAL);
  fill(mutedColor);
  textSize(15);
  text("#" + rankValue + " su " + data.getRowCount() + "  ·  " + country, iconX, iconY + iconSize / 2 + 86);
  fill(categoryColors[macro]);
  text(category, iconX, iconY + iconSize / 2 + 110);

  // colonna destra
  let listX = width * 0.5;
  let listWidth = width - listX - margin;
  let blockCols = 2;
  let blockWidth = listWidth / blockCols;
  let blockRows = ceil(rows.length / blockCols);
  let blockHeight = min(96, (height - 230) / blockRows);

  textAlign(LEFT, TOP);
  fill(textColor);
  textStyle(BOLD);
  textSize(20);
  text("Dati del profilo", listX, 80);
  textStyle(NORMAL);

  for (let i = 0; i < rows.length; i++) {
    // i % 2 = colonna, floor(i / 2) = riga
    let x = listX + (i % blockCols) * blockWidth;
    let y = 130 + floor(i / blockCols) * blockHeight;

    // etichetta, valore e posizione nel dataset 
    fill(mutedColor);
    textSize(13);
    text(rows[i].label, x, y);

    fill(textColor);
    textStyle(BOLD);
    textSize(24);
    text(rows[i].value, x, y + 22);
    textStyle(NORMAL);

    fill(mutedColor);
    textSize(12);
    text(rows[i].position, x, y + 56);
  }

}

// icona Instagram
function drawInstagramIcon(cx, cy, s, hex) {
  noStroke();
  fill(hex);
  rect(cx - s / 2, cy - s / 2, s, s, s * 0.28);

  noFill();
  stroke(255);
  strokeWeight(max(1.5, s * 0.07));
  rect(cx - s * 0.3, cy - s * 0.3, s * 0.6, s * 0.6, s * 0.17);
  circle(cx, cy, s * 0.3);

  noStroke();
  fill(255);
  circle(cx + s * 0.19, cy - s * 0.19, max(2, s * 0.07));
}

// raggruppa 
function macroCategory(categoryName) {
  if (categoryName.startsWith("Music")) return "Musica";
  if (categoryName.startsWith("Sport")) return "Sport";
  if (categoryName.startsWith("Content Creator")) return "Creator";
  if (categoryName.startsWith("Entertainment") || categoryName.startsWith("Comedy") || categoryName.startsWith("Food")) {
    return "Intrattenimento";
  }
  if (categoryName.startsWith("Fashion") || categoryName.startsWith("Media") || categoryName.startsWith("Modeling")) {
    return "Moda e media";
  }
  return "Altro";
}

// valore in forma leggibile
function formatNumber(key, value) {
  if (key === "60_day_eng_rate") return value.toFixed(2) + " %";
  if (key === "influence_score") return value + " / 100";
  if (value >= 1e9) return (value / 1e9).toFixed(1) + " mld";
  if (value >= 1e6) return (value / 1e6).toFixed(1) + " M";
  return value.toLocaleString("it-IT");
}

function mousePressed() {
  // torna alla pagina d'insieme.
  if (overBack) {
    window.location.href = "index.html";
  }
}
